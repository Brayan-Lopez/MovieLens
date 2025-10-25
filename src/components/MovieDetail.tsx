import { useGetMovieDetailQuery, useGetTvDetailQuery } from '../store/api/moviesApi';
import type { MediaType } from '../types/movie';
import ImageWithSpinner from './ImageWithSpinner'
import CollapsibleSynopsis from './CollapsibleSynopsis'

interface MovieDetailProps {
  id: number;
  type: MediaType;
  onClose?: () => void;
  showCloseButton?: boolean;
  imageHalf?: boolean;
  compact?: boolean;
}

export function MovieDetail({ id, type, onClose, showCloseButton = true, imageHalf = false, compact = false }: MovieDetailProps) {
  const { data, isFetching } = type === 'movie' ? useGetMovieDetailQuery(id) : useGetTvDetailQuery(id);

  const title = (data as any)?.title || (data as any)?.name || 'Sin título';
  const year = (data as any)?.release_date?.slice(0, 4) || (data as any)?.first_air_date?.slice(0, 4) || '—';
  const genres = (data as any)?.genres?.map((g: any) => g.name).join(', ');
  const overview = (data as any)?.overview;
  const rating = (data as any)?.vote_average ? (data as any).vote_average.toFixed(1) : undefined;
  const votes = (data as any)?.vote_count;
  const poster = (data as any)?.poster_path ? `https://image.tmdb.org/t/p/w500${(data as any).poster_path}` : undefined;

  const imageHeight = compact ? "h-[150px] md:h-[200px]" : "h-[300px] md:h-[400px]";

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className={imageHalf ? "md:w-[30%]" : ""}>
          <div className={`w-full ${imageHeight} rounded overflow-hidden`}>
            <ImageWithSpinner
              src={poster}
              alt={title}
              containerClassName="w-full h-full"
              imgClassName="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className={imageHalf ? "mt-2 md:mt-0 md:w-[70%]" : "mt-2 md:mt-0"}>
          <h2 className="mt-0 text-xl md:text-2xl font-semibold">
            {title} {isFetching && <small className="text-neutral-500">(actualizando...)</small>}
          </h2>
          <p className="text-sm md:text-base"><strong className="text-[#646cff]">Año:</strong> {year}</p>
          {genres && <p className="text-sm md:text-base"><strong className="text-[#646cff]">Género:</strong> {genres}</p>}
          {overview && (
            <div className="text-sm md:text-base">
              <p className="m-0"><strong className="text-[#646cff]">Sinopsis:</strong></p>
              <CollapsibleSynopsis text={overview} initialLines={2} />
            </div>
          )}
          {rating && <p className="text-sm md:text-base"><strong className="text-[#646cff]">TMDb:</strong> {rating} ({votes} votos)</p>}
          {onClose && showCloseButton && (
            <button onClick={onClose} className="mt-3 px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Cerrar</button>
          )}
        </div>
      </div>
    </div>
  );
}