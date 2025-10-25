import { useMemo } from 'react';
import { useGetTrendingMoviesQuery } from '../store/api/moviesApi';
import { MovieDetail } from './MovieDetail';

export function HeroHighlight() {
  const { data, isLoading, error, isFetching } = useGetTrendingMoviesQuery({ page: 1 });

  // Simplificar: calcular el top con useMemo sin helpers extra
  const candidates = Array.isArray(data?.results) ? data!.results : [];
  const top = useMemo(() => {
    if (candidates.length === 0) return undefined;
    return candidates.reduce((max, cur) => {
      const curV = Number((cur as any)?.vote_average) || 0;
      const maxV = Number((max as any)?.vote_average) || 0;
      return curV > maxV ? cur : max;
    }, candidates[0]);
  }, [data?.results]);

  // Skeleton de carga
  if (isLoading) {
    return (
      <section className="relative rounded-xl overflow-hidden bg-neutral-900 animate-pulse">
        <div className="absolute inset-0 bg-neutral-800" />
        <div className="relative p-4 sm:p-6 min-h-[120px] md:min-h-[160px] lg:min-h-[192px] flex items-end">
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
  const background = (top as any).backdrop_path
    ? `https://image.tmdb.org/t/p/original${(top as any).backdrop_path}`
    : ((top as any).poster_path ? `https://image.tmdb.org/t/p/original${(top as any).poster_path}` : undefined);
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

      <div className="relative p-4 sm:p-6 min-h-[120px] md:min-h-[160px] lg:min-h-[192px] flex items-end">
        <div className="max-w-2xl space-y-3">
          {/* Chip único "Mejor Valorada" */}
          <div className="inline-flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded glass-chip">Mejor Valorada</span>
            {isFetching && <span className="text-xs text-neutral-400" aria-live="polite">(actualizando...)</span>}
          </div>

          <div className="flex items-center gap-2">
            <h2 className="m-0 text-lg sm:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h2>
            {rating && (
              <span className="px-2 py-1 text-xs sm:text-sm font-medium rounded glass-chip" aria-label="Valoración promedio">
                ⭐ {rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {top && (
        <div className="relative z-10 p-4 sm:p-6">
          <MovieDetail id={(top as any).id} type="movie" showCloseButton={false} imageHalf={true} compact={true} />
        </div>
      )}
    </section>
  );
}