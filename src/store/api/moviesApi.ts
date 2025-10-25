import { createApi } from "@reduxjs/toolkit/query/react";
import type { TMDbSearchResponse, TMDbMovieDetail, TMDbTVDetail } from "../../types/movie";
import { baseQueryWithTmdbApiKey } from "./baseQuery";

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: baseQueryWithTmdbApiKey,
  tagTypes: ['Movie', 'Search'],
  endpoints: (builder) => ({
    // Búsqueda (TMDb): movie, tv o multi
    searchItems: builder.query<
      TMDbSearchResponse,
      { query: string; page?: number; type: 'movie'|'tv'|'multi'; language?: string }
    >({
      query: ({ query, page = 1, type, language = 'es-ES' }) => ({
        url: `/search/${type}`,
        params: {
          query,
          page,
          language,
          include_adult: false,
        },
      }),
      transformResponse: (response: TMDbSearchResponse) => response,
      providesTags: (result) => [
        { type: 'Search', id: 'LIST' },
        ...((result?.results ?? []).map(item => ({ type: 'Movie' as const, id: item.id }))),
      ],
    }),

    // Populares (Destacadas)
    getPopularMovies: builder.query<TMDbSearchResponse, { page?: number; language?: string }>({
      query: ({ page = 1, language = 'es-ES' }) => ({
        url: `/movie/popular`,
        params: { page, language },
      }),
      transformResponse: (response: TMDbSearchResponse) => response,
      providesTags: (result) => [
        { type: 'Search', id: 'POPULAR' },
        ...((result?.results ?? []).map(item => ({ type: 'Movie' as const, id: item.id }))),
      ],
    }),

    // Tendencias (día)
    getTrendingMovies: builder.query<TMDbSearchResponse, { page?: number; language?: string }>({
      query: ({ page = 1, language = 'es-ES' }) => ({
        url: `/trending/movie/day`,
        params: { page, language },
      }),
      transformResponse: (response: TMDbSearchResponse) => response,
      providesTags: (result) => [
        { type: 'Search', id: 'TRENDING' },
        ...((result?.results ?? []).map(item => ({ type: 'Movie' as const, id: item.id }))),
      ],
    }),

    // Detalle de película
    getMovieDetail: builder.query<TMDbMovieDetail, number>({
      query: (id) => ({
        url: `/movie/${id}`,
        params: { language: 'es-ES' },
      }),
      transformResponse: (response: TMDbMovieDetail) => response,
      providesTags: (result) => result?.id
        ? [{ type: 'Movie', id: result.id }]
        : [{ type: 'Movie', id: 'UNKNOWN' }],
    }),

    // Detalle de serie (TV)
    getTvDetail: builder.query<TMDbTVDetail, number>({
      query: (id) => ({
        url: `/tv/${id}`,
        params: { language: 'es-ES' },
      }),
      transformResponse: (response: TMDbTVDetail) => response,
      providesTags: (result) => result?.id
        ? [{ type: 'Movie', id: result.id }]
        : [{ type: 'Movie', id: 'UNKNOWN' }],
    }),
  }),
});

export const {
  useSearchItemsQuery,
  useGetPopularMoviesQuery,
  useGetTrendingMoviesQuery,
  useGetMovieDetailQuery,
  useGetTvDetailQuery,
} = moviesApi;
