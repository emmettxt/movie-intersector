import {
	MovieGeneric,
	SearchResultMulti,
	TvShowGeneric,
} from '~~/server/utils/types/tmdbAPI';

export default defineEventHandler(
	async (event): Promise<Array<TvShowGeneric | MovieGeneric>> => {
		const query = event.context.params?.query;
		if (!query) {
			throw createError({
				statusCode: 400,
				statusMessage: 'search query required',
			});
		}
		const response = await tmdbAxios.get<SearchResultMulti>(
			`/search/multi?query=${query}`
		);
		const results: Array<TvShowGeneric | MovieGeneric> = [];

		for (const item of response.data.results) {
			if (item.media_type !== 'person') results.push(item);
		}
		return results;
	}
);
