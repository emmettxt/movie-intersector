import tmdbAxios from '../utils/tmdbAxios';
import { TvShowDetails } from '../utils/types/tmdbAPI';

export default defineEventHandler(async (event): Promise<TvShowDetails> => {
	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'id required',
		});
	}
	const resp = await tmdbAxios.get<TvShowDetails>(`tv/${id}`);
	return resp.data;
});
