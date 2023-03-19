import { AggregateCredits } from '../../../../utils/types/tmdbAPI';

export default defineEventHandler(async (event): Promise<AggregateCredits> => {
	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'id required',
		});
	}
	const resp = await tmdbAxios.get<AggregateCredits>(
		`tv/${id}/aggregate_credits`
	);
	return resp.data;
});
