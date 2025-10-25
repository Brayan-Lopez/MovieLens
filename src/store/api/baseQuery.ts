import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// BaseQuery configurado para TMDb (v3) usando Bearer Token y api_key
const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'https://api.themoviedb.org/3',
  prepareHeaders: (headers) => {
    const token = import.meta.env.VITE_TMDB_TOKEN as string;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('accept', 'application/json');
    return headers;
  },
});

// Wrapper: asegura que las peticiones incluyan api_key si existe
export const baseQueryWithTmdbApiKey: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY as string | undefined;

  let modifiedArgs: FetchArgs;
  if (typeof args === 'string') {
    modifiedArgs = { url: args } as FetchArgs;
  } else {
    modifiedArgs = { ...args } as FetchArgs;
  }

  // Solo añade api_key si está configurada
  const baseParams = (modifiedArgs.params as any) || {};
  modifiedArgs.params = apiKey ? { ...baseParams, api_key: apiKey } : baseParams;

  return rawBaseQuery(modifiedArgs, api, extraOptions);
};

// Wrapper que convierte respuestas lógicas de error (Response: 'False') en errores de RTK Query
export const baseQueryWithLogicalError: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const data = result.data as any;

  // La API puede responder 200 OK con { Response: 'False', Error: '...' }
  if (data && typeof data === 'object' && 'Response' in data && data.Response === 'False') {
    return {
      error: {
        status: 400,
        data, // incluye Error y campos adicionales
      } as FetchBaseQueryError,
    };
  }

  return result;
};