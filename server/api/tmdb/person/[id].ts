import { PersonDetails } from '~~/server/utils/types/tmdbAPI';

export default defineEventHandler(async (event): Promise<PersonDetails> => {
	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'id required',
		});
	}
	const resp = await tmdbAxios.get<PersonDetails>(`person/${id}`);
	return resp.data;
});
