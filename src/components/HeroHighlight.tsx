import { useState, useEffect } from 'react';
import { useGetTrendingMoviesQuery } from '../store/api/moviesApi';
import { MovieDetail } from './MovieDetail';
import type { MediaType } from '../types/movie';

const imgBaseBackdrop = 'https://image.tmdb.org/t/p/original';

export function HeroHighlight() {
  const { data, isLoading, error, isFetching } = useGetTrendingMoviesQuery({ page: 1 });

  // Helper para leer vote_average sin romper tipos
  const voteAvg = (item: unknown): number => {
    const v = (item as any)?.vote_average;
    return typeof v === 'number' ? v : 0;
  };

  // Seleccionar la película con mayor votación (filtrando elementos sin vote_average)
  const candidates = Array.isArray(data?.results) ? data!.results : [];
  const top = candidates.length > 0
    ? candidates.reduce((max, cur) => (voteAvg(cur) > voteAvg(max) ? cur : max), candidates[0])
    : undefined;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);

  // Al cargar, mostrar detalles de la película con mayor votación
  useEffect(() => {
    if (top && selectedId !== top.id) {
      setSelectedId(top.id);
      setSelectedType('movie');
    }
  }, [top?.id]);

  // Skeleton de carga
  if (isLoading) {
    return (
      <section className="relative rounded-xl overflow-hidden bg-neutral-900 animate-pulse">
        <div className="absolute inset-0 bg-neutral-800" />
        <div className="relative p-4 sm:p-10 min-h-[280px] md:min_h-[420px] lg:min_h-[520px] flex items-end">
          <div className="max-w-2xl space-y-3">
            <div className="h-6 sm:h-8 w-2/3 bg-neutral-700 rounded" />
            <div className="h-4 sm:h-5 w-full bg-neutral-700 rounded" />
            <div className="h-8 w-40 bg-neutral-700 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (error) return <div className="text-red-400">No se pudo cargar el destacado.</div>;
  if (!top) return null;

  const title = (top as any).title ?? (top as any).name ?? 'Sin título';
  const overview = (top as any).overview ?? '';
  const background = (top as any).backdrop_path ? `${imgBaseBackdrop}${(top as any).backdrop_path}` : ((top as any).poster_path ? `${imgBaseBackdrop}${(top as any).poster_path}` : undefined);
  const rating = typeof (top as any)?.vote_average === 'number' ? (top as any).vote_average.toFixed(1) : undefined;

  return (
    <section className="relative rounded-xl overflow-hidden bg-neutral-900">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-neutral-800 bg-cover bg-center"
        style={background ? { backgroundImage: `url(${background})` } : undefined}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/70 to-transparent" />

      <div className="relative p-6 sm:p-10 min-h-[320px] md:min-h-[420px] lg:min-h-[520px] flex items-end">
        <div className="max-w-2xl space-y-3">
          {/* Chip único "Mejor Botada" */}
          <div className="inline-flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded glass-chip">Mejor Botada</span>
            {isFetching && <span className="text-xs text-neutral-400" aria-live="polite">(actualizando...)</span>}
          </div>

          <div className="flex items-center gap-2">
            <h2 className="m-0 text-xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{title}</h2>
            {rating && (
              <span className="px-2 py-1 text-xs sm:text-sm font-medium rounded glass-chip" aria-label="Valoración promedio">
                ⭐ {rating}
              </span>
            )}
          </div>
          {overview && <p className="text-xs sm:text-base lg:text-lg text-neutral-200 line-clamp-3">{overview}</p>}
          {/* Botones de acción removidos */}
        </div>
      </div>

      {selectedId && selectedType && (
        <div className="relative z-10 p-6 sm:p-10">
          <MovieDetail id={selectedId} type={selectedType} showCloseButton={false} />
        </div>
      )}
    </section>
  );
}