export interface Collection {
	id: number;
	backdrop_path: string;
	name: string;
	poster_path: string;
}

export interface Movie {
	id: number;
	title: string;
	original_title: string;
	poster_path: string;
	adult: boolean;
	overview: string;
	release_date: string;
	genre_ids: number[];
	original_language: string;
	backdrop_path: string;
	popularity: number;
	vote_count: number;
	video: boolean;
	vote_average: number;
}

export interface CollectionDetails extends Collection {
	overview: string;
	parts: Movie[];
}

export interface Company {
	id: number;
	logo_path: string;
	name: string;
}
export interface Country {
	iso_3166_1: string;
	name: string;
}

export interface Genre {
	id: number;
	name: string;
}

export interface Keyword {
	id: number;
	name: string;
}

export interface Language {
	iso_639_1: string;
	name: string;
}

export interface Network {
	id: number;
	name: string;
}

export interface MovieDetails extends Movie {
	belongs_to_collection: Collection;
	budget: number;
	genres: Genre[];
	homepage: string;
	imdb_id: string;
	production_companies: Company[];
	production_countries: Country[];
	revenue: number;
	runtime: number;
	spoken_languages: Language[];
	status: string;
	tagline: string;
}

export interface MovieDetailsGeneric extends MovieDetails {
	media_type: 'movie';
}

export interface SearchResult<T> {
	page: number;
	results: Array<T>;
	total_results: number;
	total_pages: number;
}

export interface Season {
	id: number;
	episode_count: number;
	poster_path: string;
	season_number: number;
	air_date: string;
}

export interface TvShow {
	id: number;
	name: string;
	original_name: string;
	poster_path: string;
	popularity: number;
	backdrop_path: string;
	vote_average: number;
	overview: string;
	origin_country: string[];
	genre_ids: number[];
	original_language: string;
	vote_count: number;
	first_air_date: string;
}

export interface TvShowMultiSearch extends TvShow {
	media_type: 'tv';
}
export interface MovieGeneric extends Movie {
	media_type: 'movie';
}
export interface TvShowGeneric extends TvShow {
	media_type: 'tv';
}

export interface Person {
	id: number;
	name: string;
	profile_path: string;
	adult: boolean;
	popularity: number;
	known_for: Array<MovieGeneric | TvShowGeneric>;
}

export interface PersonGeneric extends Person {
	media_type: 'person';
}

export interface PersonDetails extends Person {
	also_known_as: string[];
	biography: string;
	birthday: string;
	deathday: string;
	gender: number;
	homepage: string;
	imdb_id: string;
	place_of_birth: string;
}

export interface TvShowDetails extends TvShow {
	created_by: Person[];
	episode_run_time: number[];
	genres: Genre[];
	homepage: string;
	in_production: boolean;
	languages: string[];
	networks: Network[];
	number_of_episodes: number;
	number_of_seasons: number;
	production_companies: Company[];
	seasons: Season[];
	status: string;
	type: string;
	last_air_date: string;
}

export interface TvShowDetailsGeneric extends TvShowDetails {
	media_type: 'tv';
}

interface CreditBase {
	adult?: boolean;
	gender?: number | null;
	id?: number;
	known_for_department?: string;
	name?: string;
	original_name?: string;
	popularity?: number;
	profile_path?: string | null;
}
export interface Cast extends CreditBase {
	cast_id?: number;
	character?: string;
	credit_id?: string;
	order?: number;
}

export interface Crew extends CreditBase {
	credit_id?: string;
	department?: string;
	job?: string;
}

export interface AggregateCast extends CreditBase {
	roles: {
		credit_id?: string;
		character?: string;
		episode_count?: number;
	}[];
	total_episode_count: number;
	order: number;
}

export interface AggregateCrew extends CreditBase {
	jobs: {
		credit_id?: string;
		job?: string;
		episode_count?: number;
	}[];
	total_episode_count: number;
	department: string;
}

export interface AggregateCredits {
	id: number;
	cast: AggregateCast[];
	crew: AggregateCrew[];
}

export interface Credits {
	id: number;
	cast: Cast[];
	crew: Crew[];
}

export type Multi = TvShowGeneric | MovieGeneric | PersonGeneric;

export type SearchResultMulti = SearchResult<Multi>;
