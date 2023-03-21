import {
	MovieGeneric,
	TvShowGeneric,
	Cast,
	Crew,
	Credits,
	AggregateCredits,
	PersonDetails,
	TvShowDetails,
	MovieDetails,
	AggregateCast,
	AggregateCrew,
} from '../utils/types/tmdbAPI';
type setItem = Pick<MovieGeneric | TvShowGeneric, 'media_type' | 'id'>;
type set = setItem[];

interface CrewGeneric extends Crew {
	type: 'crew';
}
interface CastGeneric extends Cast {
	type: 'cast';
}
interface AggregateCastGeneric extends AggregateCast {
	type: 'cast';
}
interface AggregateCrewGeneric extends AggregateCrew {
	type: 'crew';
}

interface TvShowCreditsFullDetails {
	credits: AggregateCredits;
	media_type: 'tv';
	mediaDetails: TvShowDetails;
}

interface MovieCreditsFullDetails {
	credits: Credits;
	media_type: 'movie';
	mediaDetails: MovieDetails;
}
type CreditsFullDetails = MovieCreditsFullDetails | TvShowCreditsFullDetails;

// a single credit
interface TvCreditFullDetails {
	credit: AggregateCastGeneric | AggregateCrewGeneric;
	media_type: 'tv';
	mediaDetails: TvShowDetails;
}

interface MovieCreditFullDetails {
	credit: CastGeneric | CrewGeneric;
	media_type: 'movie';
	mediaDetails: MovieDetails;
}

type CreditFullDetails = TvCreditFullDetails | MovieCreditFullDetails;

export interface IntersectionResponse {
	people: Array<{ person: PersonDetails; credits: CreditFullDetails[] }>;
}

export default defineEventHandler(
	async (event): Promise<IntersectionResponse> => {
		const { sets } = parseBody(await readBody(event));
		const setsCredits = await Promise.all(
			sets.map((set) => getSetCreditsAndDetails(set))
		);
		const commonPeopleIds = getCommonPersonIDs(setsCredits);

		const commonPeople = (
			await Promise.all(
				Array.from(commonPeopleIds).map((id) =>
					$fetch(`/api/tmdb/person/${id}`)
				)
			)
		)
			.sort((a, b) => b.popularity - a.popularity)
			.map((person) => ({
				person,
				credits: setsCredits
					.map((setcredits) =>
						setcredits.filter((credit) => credit.credit.id === person.id)
					)
					.reduce((array, s) => array.concat(s), []),
			}));
		return { people: commonPeople };
	}
);

const getCommonPersonIDs = (setsCredits: CreditFullDetails[][]) => {
	const peopleIds = getUniquePersonIdsFromSets(setsCredits);
	for (const personId of peopleIds) {
		// if there is any set that does not contain the id, remove it and move on to the next
		for (const set of setsCredits) {
			if (!set.some((c) => c.credit.id === personId)) {
				peopleIds.delete(personId);
				break;
			}
		}
	}
	return peopleIds;
};

const getUniquePersonIdsFromSets = (setsCredits: CreditFullDetails[][]) => {
	const personIds = new Set<number>();
	for (const set of setsCredits) {
		for (const credit of set) {
			if (credit.credit.id) personIds.add(credit.credit.id);
		}
	}
	return personIds;
};

const getSetItemDetailsAndCredits = (
	setItem: setItem
): Promise<CreditsFullDetails> =>
	new Promise((resolve, reject) => {
		if (setItem.media_type === 'movie') {
			Promise.all([
				$fetch(`/api/tmdb/movie/${setItem.id}/credits`),
				$fetch(`/api/tmdb/movie/${setItem.id}`),
			])
				.then(([credits, movieDetails]) =>
					resolve({
						credits,
						mediaDetails: movieDetails,
						media_type: 'movie',
					})
				)
				.catch((error) => reject(error));
		} else {
			Promise.all([
				$fetch(`/api/tmdb/tv/${setItem.id}/aggregate_credits`),
				$fetch(`/api/tmdb/tv/${setItem.id}`),
			])
				.then(([credits, tvShowDetails]) =>
					resolve({
						credits,
						mediaDetails: tvShowDetails,
						media_type: 'tv',
					})
				)
				.catch((error) => reject(error));
		}
	});

const getSetCreditsAndDetails = async (
	set: set
): Promise<CreditFullDetails[]> => {
	const creditsArray: CreditFullDetails[] = (
		await Promise.all(
			set.map((setItem) => getSetItemDetailsAndCredits(setItem))
		)
	)
		.map((creditsFullDetails) => flattenCreditsWithSetItem(creditsFullDetails))
		.reduce(
			(array, creditfulldetailsarray) => array.concat(creditfulldetailsarray),
			[]
		);
	return creditsArray;
};

const flattenCreditsWithSetItem = (
	creditsFullDetails: CreditsFullDetails
): CreditFullDetails[] => {
	const creditFullDetailsArray: CreditFullDetails[] = [];
	const mediaType = creditsFullDetails.media_type;
	if (mediaType === 'tv') {
		const { mediaDetails } = creditsFullDetails;

		for (const credit of creditsFullDetails.credits.cast) {
			creditFullDetailsArray.push({
				media_type: 'tv',
				mediaDetails,
				credit: { type: 'cast', ...credit },
			});
		}
		for (const credit of creditsFullDetails.credits.crew) {
			creditFullDetailsArray.push({
				media_type: 'tv',
				mediaDetails,
				credit: { type: 'crew', ...credit },
			});
		}
	} else {
		const { mediaDetails } = creditsFullDetails;

		for (const credit of creditsFullDetails.credits.cast) {
			creditFullDetailsArray.push({
				media_type: 'movie',
				mediaDetails,
				credit: { type: 'cast', ...credit },
			});
		}
		for (const credit of creditsFullDetails.credits.crew) {
			creditFullDetailsArray.push({
				media_type: 'movie',
				mediaDetails,
				credit: { type: 'crew', ...credit },
			});
		}
	}
	return creditFullDetailsArray;
};

const parseBody = (body: unknown): { sets: set[] } => {
	if (!body || typeof body !== 'object')
		throw createError({
			statusCode: 400,
			statusMessage: 'request body required',
		});

	if (!('sets' in body))
		throw createError({
			statusCode: 400,
			statusMessage: 'request body required',
		});

	if (!Array.isArray(body.sets))
		throw createError({
			statusCode: 400,
			statusMessage: 'body.sets must be an array',
		});
	return { sets: parseSets(body.sets) };
};

const parseSets = (sets: unknown): set[] => {
	if (!Array.isArray(sets))
		throw createError({
			statusCode: 400,
			statusMessage: 'body.sets must be an array',
		});

	return sets.map((set) => parseSet(set));
};

const parseSet = (set: unknown): set => {
	if (!set || !Array.isArray(set))
		throw createError({
			statusCode: 400,
			statusMessage: `set must be an array, value ${JSON.stringify(
				set
			)} is invalid`,
		});
	return set.map((setItem) => parseSetItem(setItem));
};

const parseSetItem = (setItem: unknown): setItem => {
	if (!setItem || typeof setItem !== 'object')
		throw createError({
			statusCode: 400,
			statusMessage: `set item of incorect type, value ${JSON.stringify(
				setItem
			)} is invalid. Must be an object`,
		});
	if (!('media_type' in setItem))
		throw createError({
			statusCode: 400,
			statusMessage: `value of media_type is required, value ${JSON.stringify(
				setItem
			)} is invalid.`,
		});
	if (!('id' in setItem))
		throw createError({
			statusCode: 400,
			statusMessage: `value of id is required, value ${JSON.stringify(
				setItem
			)} is invalid.`,
		});
	return {
		media_type: parseMediaType(setItem.media_type),
		id: parseId(setItem.id),
	};
};

const parseMediaType = (mediaType: unknown): setItem['media_type'] => {
	if (mediaType === 'movie' || mediaType === 'tv') return mediaType;
	throw createError({
		statusCode: 400,
		statusMessage: `value of media_type must be 'tv' or 'movie', value ${JSON.stringify(
			mediaType
		)} is invalid.`,
	});
};

const parseId = (id: unknown): number => {
	if (id && isNumber(id)) return Number(id);
	throw createError({
		statusCode: 400,
		statusMessage: `value of id must be a number, value ${JSON.stringify(
			id
		)} is invalid.`,
	});
};

const isNumber = (n: unknown): n is number =>
	typeof n === 'number' || !isNaN(Number(n));
