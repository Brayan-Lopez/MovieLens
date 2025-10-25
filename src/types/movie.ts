// Item en resultados de búsqueda
export interface SearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  Poster: string; // puede ser 'N/A'
}

// Respuesta de búsqueda
export interface SearchResponse {
  Search?: SearchItem[];
  totalResults?: string; // viene como string
  Response: 'True' | 'False';
  Error?: string;
}

// Detalle de película/serie
export interface MovieDetail {
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  totalSeasons?: string;
  Response: 'True' | 'False';
  Error?: string;
}

// Tipos para TMDb
export type MediaType = 'movie' | 'tv';

export interface TMDbSearchItem {
  id: number;
  media_type?: MediaType; // en /search/movie|tv no viene; en /search/multi sí
  title?: string; // movies
  name?: string; // tv
  release_date?: string; // movies
  first_air_date?: string; // tv
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
}

export interface TMDbSearchResponse {
  page: number;
  results: TMDbSearchItem[];
  total_results: number;
  total_pages: number;
}

export interface TMDbGenre { id: number; name: string }

export interface TMDbMovieDetail {
  id: number;
  title: string;
  release_date?: string;
  genres?: TMDbGenre[];
  overview?: string;
  poster_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
}

export interface TMDbTVDetail {
  id: number;
  name: string;
  first_air_date?: string;
  genres?: TMDbGenre[];
  overview?: string;
  poster_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
}