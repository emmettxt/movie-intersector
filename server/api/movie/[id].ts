import tmdbAxios from '../../utils/tmdbAxios';
import { MovieDetails } from '../../utils/types/tmdbAPI';

export default defineEventHandler(async (event): Promise<MovieDetails> => {
	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'id required',
		});
	}
	const resp = await tmdbAxios.get<MovieDetails>(`movie/${id}`);
	return resp.data;
});
