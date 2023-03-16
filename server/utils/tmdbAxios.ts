import axios, { AxiosError } from 'axios';

const baseURL = 'https://api.themoviedb.org/3/';
const token = process.env.TMDB_API_ACCESS_TOKEN;
// const apiKey = process.env.TMDB_API_KEY;

const tmdbAxios = axios.create({
	baseURL,
	headers: { Authorization: `Bearer ${token}` },
});

tmdbAxios.interceptors.response.use(
	(res) => {
		return res;
	},
	(error) => {
		if (error instanceof AxiosError) {
			throw createError({
				statusCode: error.response?.status,
				data: error.response?.data,
				message: error.response?.data.status_message,
			});
		}
	}
);

export default tmdbAxios;
