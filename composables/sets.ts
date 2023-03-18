import { MovieGeneric, TvShowGeneric } from '~~/server/utils/types/tmdbAPI';

export const useSets = () =>
	useState(
		'sets',
		() =>
			({ set1: [], set2: [] } as {
				[key: string]: (MovieGeneric | TvShowGeneric)[];
			})
	);
