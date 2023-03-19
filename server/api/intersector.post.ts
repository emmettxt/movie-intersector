import {
	MovieGeneric,
	TvShowGeneric,
	Cast,
	Crew,
	Credits,
	AggregateCredits,
} from '../utils/types/tmdbAPI';
type setItem = Pick<MovieGeneric | TvShowGeneric, 'media_type' | 'id'>;
type set = setItem[];

interface CrewGeneric extends Crew {
	type: 'crew';
}
interface CastGeneric extends Cast {
	type: 'cast';
}

interface CreditsWithSetItem {
	setItem: setItem;
	credits: Credits | AggregateCredits;
}
interface CreditWithSetItem {
	setItem: setItem;
	credit: CrewGeneric | CastGeneric;
}

export default defineEventHandler(async (event) => {
	const body = parseBody(await readBody(event));
	const setsCreditsPromises = body.sets.map((set) => getSetCredits(set));
	const setsCredits = await Promise.all(setsCreditsPromises);
	const commonPeopleIds = getCommonPersonIDs(setsCredits);

	const res = setsCredits.map((creditWithSetItemArray) =>
		creditWithSetItemArray.filter(
			(cred) => cred.credit.id && commonPeopleIds.has(cred.credit.id)
		)
	);
	return res;
});

const getCommonPersonIDs = (setsCredits: CreditWithSetItem[][]) => {
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

const getUniquePersonIdsFromSets = (setsCredits: CreditWithSetItem[][]) => {
	const personIds = new Set<number>();
	for (const set of setsCredits) {
		for (const credit of set) {
			if (credit.credit.id) personIds.add(credit.credit.id);
		}
	}
	return personIds;
};

const getSetCredits = async (set: set): Promise<CreditWithSetItem[]> => {
	const creditsPromises = set.map(
		(setItem) =>
			new Promise<CreditsWithSetItem>((resolve) => {
				(setItem.media_type === 'movie'
					? $fetch(`/api/tmdb/movie/${setItem.id}/credits`)
					: $fetch(`/api/tmdb/tv/${setItem.id}/aggregate_credits`)
				).then((credits) => resolve({ setItem, credits }));
			})
	);
	const credits = (await Promise.all(creditsPromises))
		.map((creditsWithSetItem) => flattenCreditsWithSetItem(creditsWithSetItem))
		.reduce(
			(creditWithSetItemArray, creditWithSetItem) =>
				creditWithSetItemArray.concat(creditWithSetItem),
			[] as CreditWithSetItem[]
		);
	return credits;
};

const flattenCreditsWithSetItem = (
	creditsWithSetItem: CreditsWithSetItem
): CreditWithSetItem[] => {
	const creditWithSetItemArray: CreditWithSetItem[] = [];
	const { setItem } = creditsWithSetItem;
	for (const credit of creditsWithSetItem.credits.cast) {
		creditWithSetItemArray.push({
			setItem,
			credit: { type: 'cast', ...credit },
		});
	}
	for (const credit of creditsWithSetItem.credits.crew) {
		creditWithSetItemArray.push({
			setItem,
			credit: { type: 'crew', ...credit },
		});
	}
	return creditWithSetItemArray;
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
