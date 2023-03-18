import tmdbAxios from '~~/server/utils/tmdbAxios';
import { Credits } from '~~/server/utils/types/tmdbAPI';

export default defineEventHandler(async (event): Promise<Credits> => {
	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'id required',
		});
	}
	const resp = await tmdbAxios.get<Credits>(`movie/${id}/credits`);
	return resp.data;
});
