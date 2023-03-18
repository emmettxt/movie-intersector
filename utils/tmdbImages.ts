import { type Config, config } from './tmdbConfig';

export const getPosterUrl = (
	path: string,
	size: Config['images']['poster_sizes'][number]
) => config.images.secure_base_url + size + path;
