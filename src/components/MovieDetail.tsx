import { useGetMovieDetailQuery, useGetTvDetailQuery } from '../store/api/moviesApi';
import type { MediaType } from '../types/movie';
import ImageWithSpinner from './ImageWithSpinner'

interface MovieDetailProps {
  id: number;
  type: MediaType;
  onClose?: () => void;
  showCloseButton?: boolean;
  imageHalf?: boolean;
}

const imgBase = 'https://image.tmdb.org/t/p/w500';

export function MovieDetail({ id, type, onClose, showCloseButton = true, imageHalf = false }: MovieDetailProps) {
  const movieQ = type === 'movie' ? useGetMovieDetailQuery(id) : undefined;
  const tvQ = type === 'tv' ? useGetTvDetailQuery(id) : undefined;

  const isLoading = movieQ?.isLoading || tvQ?.isLoading || false;
  const error = movieQ?.error || tvQ?.error;
  const isFetching = movieQ?.isFetching || tvQ?.isFetching || false;
  const data = (type === 'movie' ? movieQ?.data : tvQ?.data) as any;

  if (isLoading) return <div className="text-neutral-400">Cargando detalle...</div>;
  if (error) return <div className="text-red-400">Error al cargar el detalle.</div>;
  if (!data) return null;

  const title = type === 'movie' ? data.title : data.name;
  const date = type === 'movie' ? data.release_date : data.first_air_date;
  const year = date ? new Date(date).getFullYear() : '—';
  const poster = data.poster_path ? `${imgBase}${data.poster_path}` : '';
  const genres = (data.genres ?? []).map((g: any) => g.name).join(', ');
  const overview = data.overview;
  const rating = data.vote_average;
  const votes = data.vote_count;

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        <div className={imageHalf ? "md:w-1/2" : ""}>
          <div className="w-full h-64 md:h-full">
            <ImageWithSpinner
              src={poster}
              alt={title}
              containerClassName="w-full h-full"
              imgClassName="max-w-full max-h-full object-cover"
            />
          </div>
        </div>
        <div className={imageHalf ? "mt-2 md:mt-0 md:w-1/2" : "mt-2 md:mt-0"}>
          <h2 className="mt-0 text-xl md:text-2xl font-semibold">
            {title} {isFetching && <small className="text-neutral-500">(actualizando...)</small>}
          </h2>
          <p className="text-sm md:text-base"><strong>Año:</strong> {year}</p>
          {genres && <p className="text-sm md:text-base"><strong>Género:</strong> {genres}</p>}
          {overview && <p className="text-sm md:text-base"><strong>Sinopsis:</strong> {overview}</p>}
          {rating && <p className="text-sm md:text-base"><strong>TMDb:</strong> {rating} ({votes} votos)</p>}
          {onClose && showCloseButton && (
            <button onClick={onClose} className="mt-3 px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Cerrar</button>
          )}
        </div>
      </div>
    </div>
  );
}