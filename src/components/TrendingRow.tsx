import { useEffect, useRef, useState } from 'react';
import { useGetTrendingMoviesQuery } from '../store/api/moviesApi';
import { MovieDetail } from './MovieDetail';
import type { MediaType } from '../types/movie';
import ImageWithSpinner from './ImageWithSpinner'

const imgBase = 'https://image.tmdb.org/t/p/w342';

export function TrendingRow() {
  const { data, isLoading, error, isFetching } = useGetTrendingMoviesQuery({ page: 1 });
  const items = data?.results ?? [];

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);

  const rowRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth - 1;
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft < max);
    };
    update();
    el.addEventListener('scroll', update, { passive: true } as any);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update as any);
      window.removeEventListener('resize', update);
    };
  }, [items.length]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByAmount('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByAmount('right');
    }
  };

  return (
    <section className="relative space-y-3" aria-label="Carrusel de tendencias">
      <div className="flex items-center gap-2">
        <h3 className="text-lg sm:text-xl font-bold">Tendencias</h3>
        {isFetching && <span className="text-xs sm:text-sm text-neutral-500" aria-live="polite">(actualizando...)</span>}
      </div>

      {isLoading && <div className="text-neutral-400">Cargando tendencias...</div>}
      {error && <div className="text-red-400">No se pudo cargar tendencias.</div>}

      {!!items.length && (
        <div className="relative w-full overflow-hidden">
          {/* Fade lateral */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-10 md:w-12 bg-gradient-to-r from-neutral-900 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-10 md:w-12 bg-gradient-to-l from-neutral-900 to-transparent" />
        <div className="grid grid-cols-[auto_1fr_auto] items-stretch relative w-full">
          {/* Botón izquierdo fuera del carrusel */}
          <div className="pointer-events-none flex">
            <button
              aria-label="Anterior"
              className={`pointer-events-auto glass-button w-10 sm:w-12 h-full ${!canLeft ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => scrollByAmount('left')}
              disabled={!canLeft}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="text-neutral-100">
                <path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Centro: carrusel */}
          <div className="relative min-w-0">
            {/* Fade lateral dentro del centro */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-10 md:w-12 bg-gradient-to-r from-neutral-900 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-10 md:w-12 bg-gradient-to-l from-neutral-900 to-transparent" />
            <div
              ref={rowRef}
              className="snap-x snap-mandatory overflow-hidden focus:outline-none w-full"
              role="list"
              tabIndex={0}
              onKeyDown={onKeyDown}
            >
              <div className="flex gap-2 sm:gap-3 pb-2 px-[10px]">
                {items.slice(0, 20).map((m) => {
                  const title = m.title ?? 'Sin título';
                  const posterUrl = m.poster_path ? `${imgBase}${m.poster_path}` : undefined;
                  return (
                    <button
                      key={m.id}
                      className="min-w-[120px] sm:min-w-[160px] md:min-w-[180px] snap-start group rounded-lg overflow-hidden glass-card text-left"
                      onClick={() => { setSelectedId(m.id); setSelectedType('movie'); }}
                      role="listitem"
                      style={selectedId === m.id ? { borderColor: '#646cff', borderWidth: '3px', borderStyle: 'solid' } : undefined}
                    >
                      <div className="h-40 sm:h-52 md:h-56">
                        {/* Imagen con spinner mientras carga y permanente si no hay imagen */}
                        <ImageWithSpinner
                          src={posterUrl}
                          alt={title}
                          containerClassName="w-full h-full"
                          imgClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="p-2 sm:p-3 h-14 sm:h-16 flex items-center">
                        <h3 className="m-0 text-xs sm:text-sm font-medium text-neutral-100 line-clamp-2 overflow-hidden text-ellipsis">{title}</h3>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botón derecho fuera del carrusel */}
          <div className="pointer-events-none flex">
            <button
              aria-label="Siguiente"
              className={`pointer-events-auto glass-button w-10 sm:w-12 h-full ${!canRight ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => scrollByAmount('right')}
              disabled={!canRight}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="text-neutral-100">
                <path d="M8.5 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
          </div>
      )}

      {selectedId && selectedType && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedId(null); setSelectedType(null); }}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-4xl glass-panel rounded-lg p-6">
            <button
              onClick={() => { setSelectedId(null); setSelectedType(null); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full glass-button text-neutral-300 hover:text-white transition-colors"
              aria-label="Cerrar detalles"
            >
              ×
            </button>
            <MovieDetail
              id={selectedId}
              type={selectedType}
              onClose={() => { setSelectedId(null); setSelectedType(null); }}
              showCloseButton={false}
              imageHalf={true}
            />
          </div>
        </div>
      )}
    </section>
  );
}