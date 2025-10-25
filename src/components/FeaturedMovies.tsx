import { useState, useMemo, useEffect, useRef } from 'react'
import { useGetPopularMoviesQuery } from '../store/api/moviesApi';
import { MovieCoverCard } from './MovieCoverCard';
import { MovieDetail } from './MovieDetail';
import type { MediaType, TMDbSearchItem } from '../types/movie';
import { SkeletonCard } from './SkeletonCard'
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const imgBase = 'https://image.tmdb.org/t/p/w342';

// Mapea la paginación de TMDb (20 por página) a UI (20 por página)
function mapUiPageToApi(uiPage: number) {
  const apiPage = uiPage; // ahora 1:1
  return { apiPage };
}

export function FeaturedMovies() {
  const [uiPage, setUiPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);

  const { apiPage } = useMemo(() => mapUiPageToApi(uiPage), [uiPage]);
  const { data, error, isLoading, isFetching } = useGetPopularMoviesQuery({ page: apiPage });

  // Leer resultados de búsqueda y filtros globales
  const search = useSelector((state: RootState) => state.ui.search);
  const filters = useSelector((state: RootState) => state.ui.filters);
  const usingSearch = !!search && (search.results?.length ?? 0) > 0;

  const filteredResults = useMemo(() => {
    const items = (search?.results ?? []) as TMDbSearchItem[];
    if (!items.length) return [];

    let next = items.slice();

    // Calidad por vote_average
    if (filters.quality !== 'all') {
      next = next.filter(i => {
        const v = i.vote_average ?? 0;
        if (filters.quality === 'high') return v >= 7.0;
        if (filters.quality === 'medium') return v >= 5.0 && v < 7.0;
        return v < 5.0;
      });
    }

    // Género
    if (filters.genreId !== 'all') {
      next = next.filter(i => (i.genre_ids ?? []).includes(Number(filters.genreId)));
    }

    // Clasificación adulto
    if (filters.classification !== 'all') {
      const wantAdult = filters.classification === 'adult';
      next = next.filter(i => Boolean(i.adult) === wantAdult);
    }

    // Año
    if (filters.year !== 'all') {
      const y = Number(filters.year);
      next = next.filter(i => {
        const dateStr = (i.media_type === 'movie' ? i.release_date : i.first_air_date) ?? '';
        const year = dateStr ? Number(dateStr.slice(0, 4)) : NaN;
        return year === y;
      });
    }

    // Idioma original
    if (filters.language !== 'all') {
      next = next.filter(i => i.original_language === filters.language);
    }

    // Orden
    if (filters.sortBy === 'recent') {
      next.sort((a, b) => {
        const da = (a.media_type === 'movie' ? a.release_date : a.first_air_date) ?? '';
        const db = (b.media_type === 'movie' ? b.release_date : b.first_air_date) ?? '';
        return (db || '').localeCompare(da || '');
      });
    } else if (filters.sortBy === 'rating') {
      next.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    } else if (filters.sortBy === 'popularity') {
      next.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    } else if (filters.sortBy === 'title_asc') {
      next.sort((a, b) => ((a.title ?? a.name ?? '').localeCompare(b.title ?? b.name ?? '')));
    }

    return next;
  }, [search?.results, filters]);

  const items = useMemo(() => {
    return usingSearch ? filteredResults : (data?.results ?? []);
  }, [usingSearch, filteredResults, data?.results]);

  // Ref del contenedor interior de la card de detalle
  const detailCardRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!selectedId) return;
    // Espera al siguiente tick para asegurar que el DOM del detalle está montado
    const t = setTimeout(() => {
      const el = detailCardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 0);
    return () => clearTimeout(t);
  }, [selectedId]);

  const totalResults = usingSearch ? (search?.totalResults ?? 0) : (data?.total_results ?? 0);
  const totalPagesUi = typeof data?.total_pages === 'number'
    ? data.total_pages
    : Math.max(1, Math.ceil(totalResults / 20));
  const totalPagesCap = Math.min(totalPagesUi, 500);

  return (
    <div className="space-y-4">
      {isLoading && !usingSearch && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div key={idx} className="contents">
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}
      {error && !usingSearch && (
        <div className="text-sm text-red-400">
          Error al cargar destacadas. {(() => {
            const e = error as any;
            const msg = e?.data?.status_message || e?.data?.message || e?.status;
            return msg ? `(${String(msg)})` : null;
          })()}
        </div>
      )}

      {!!items.length && (
        <>
          <div className="mb-2 text-sm text-neutral-300">
            <strong>Resultados:</strong> {totalResults}
            {isFetching && !usingSearch && <span className="ml-2 text-neutral-500">(actualizando...)</span>}
            {usingSearch && <span className="ml-2 text-neutral-500">(desde búsqueda)</span>}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4">
            {items.map((m) => {
              const type: MediaType = ((m as any).media_type ?? ((m as any).title ? 'movie' : 'tv')) as MediaType;
              const title = (m as any).title ?? (m as any).name ?? 'Sin título';
              const posterUrl = (m as any).poster_path ? `${imgBase}${(m as any).poster_path}` : undefined;
              const isSelected = selectedId === (m as any).id;
              return (
                <div key={(m as any).id} className="contents">
                  <MovieCoverCard
                    title={title}
                    posterUrl={posterUrl}
                    onClick={() => { setSelectedId((m as any).id); setSelectedType(type); }}
                    selected={isSelected}
                  />
                </div>
              );
            })}
          </div>

          {/* Paginación destacadas (oculta si usamos búsqueda) */}
          {!usingSearch && (
            
            <div className="flex items-center justify-center gap-2 mt-4 max-[528px]:flex-col max-[528px]:gap-3 mx-auto">
              {/* Flecha derecha arriba en mobile */}

<div className="hidden max-[528px]:flex w-full justify-center gap-2 max-[528px]:gap-2">
                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:block min-[529px]:hidden"
                  onClick={() => setUiPage((p) => Math.max(1, p - 1))}
                  disabled={uiPage <= 1}
                  aria-label="Anterior"
                  title="Anterior"
                >
                  <span aria-hidden="true">{'<'}</span>
                </button>
                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:block min-[529px]:hidden"
                  onClick={() => setUiPage(1)}
                  disabled={uiPage <= 1}
                  aria-label="Primera"
                  title="Primera"
                >
                  <span aria-hidden="true">{'<<'}</span>
                </button>
                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:block min-[529px]:hidden"
                  onClick={() => setUiPage(totalPagesCap)}
                  disabled={uiPage >= totalPagesCap}
                  aria-label="Última"
                  title="Última"
                >
                  <span aria-hidden="true">{'>>'}</span>
                </button>
                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:block min-[529px]:hidden"
                  onClick={() => setUiPage((p) => Math.min(totalPagesCap, p + 1))}
                  disabled={uiPage >= totalPagesCap}
                  aria-label="Siguiente"
                  title="Siguiente"
                >
                  <span aria-hidden="true">{'>'}</span>
                </button>
              </div>

              {/* Flecha izquierda en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setUiPage((p) => Math.max(1, p - 1))}
                disabled={uiPage <= 1}
                aria-label="Anterior"
                title="Anterior"
              >
                <span aria-hidden="true">{'<'}</span>
              </button>

              {/* Primera página en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setUiPage(1)}
                disabled={uiPage <= 1}
                aria-label="Primera"
                title="Primera"
              >
                <span aria-hidden="true">{'<<'}</span>
              </button>

              {/* Números */}
              <div className="flex items-center gap-2 justify-center max-[528px]:gap-1 max-[528px]:text-[0.5rem]">
                <div className="flex items-center gap-1 max-[528px]:gap-1">
                  {(() => {
                    const maxVisible = 4;
                    const lastPage = Math.max(1, totalPagesCap);
                    let startPage = Math.max(1, Math.min(uiPage - 1, Math.max(1, (lastPage - 1) - (maxVisible - 1))));
                    let endPage = Math.min(lastPage - 1, startPage + (maxVisible - 1));

                    const pages: number[] = [];
                    if (lastPage > 1) {
                      for (let p = startPage; p <= endPage; p++) pages.push(p);
                    }

                    return (
                      <>
                        {pages.map((p) => (
                          p === uiPage ? (
                            <button
                              key={`page-${p}`}
                              aria-current="page"
                              disabled
                              className="glass-button px-2 py-1 rounded font-semibold cursor-default max-[528px]:px-1 max-[528px]:py-0.5 max-[528px]:text-[0.5rem]"
                              style={{ color: '#646cff', borderColor: '#646cff' }}
                            >
                              {p}
                            </button>
                          ) : (
                            <button
                              key={`page-${p}`}
                              className="glass-button px-2 py-1 rounded text-neutral-300 max-[528px]:px-1 max-[528px]:py-0.5 max-[528px]:text-[0.5rem]"
                              onClick={() => setUiPage(p)}
                            >
                              {p}
                            </button>
                          )
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Última página en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setUiPage(totalPagesCap)}
                disabled={uiPage >= totalPagesCap}
                aria-label="Última"
                title="Última"
              >
                <span aria-hidden="true">{'>>'}</span>
              </button>

              {/* Flecha derecha en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setUiPage((p) => Math.min(totalPagesCap, p + 1))}
                disabled={uiPage >= totalPagesCap}
                aria-label="Siguiente"
                title="Siguiente"
              >
                <span aria-hidden="true">{'>'}</span>
              </button>
            </div>
          )}
        </>
      )}

      {selectedId && selectedType && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedId(null); setSelectedType(null); }}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-4xl glass-panel rounded-lg p-6" ref={detailCardRef}>
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

    </div>
  );
}