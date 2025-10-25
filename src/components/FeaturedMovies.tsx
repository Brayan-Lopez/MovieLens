import { useState, useMemo, useEffect, useRef } from 'react'
import { useGetPopularMoviesQuery } from '../store/api/moviesApi';
import { MovieCoverCard } from './MovieCoverCard';
import { MovieDetail } from './MovieDetail';
import type { MediaType } from '../types/movie';
import { SkeletonCard } from './SkeletonCard'

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

  const items = useMemo(() => {
    const base = data?.results ?? [];
    return base; // mostrar los 20 elementos de la página de TMDb
  }, [data]);

  // Eliminado cálculo de columnas no usado (gridRef/cols/effect)

  // Eliminado selectedIndex no usado

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

  const totalResults = data?.total_results ?? 0;
  const totalPagesUi = typeof data?.total_pages === 'number' 
    ? data.total_pages 
    : Math.max(1, Math.ceil(totalResults / 20));

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div key={idx} className="contents">
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}
      {error && (
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
            {isFetching && <span className="ml-2 text-neutral-500">(actualizando...)</span>}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4">
            {items.map((m) => {
              const title = m.title ?? 'Sin título';
              const posterUrl = m.poster_path ? `${imgBase}${m.poster_path}` : undefined;
              const isSelected = selectedId === m.id;
              return (
                <div key={m.id} className="contents">
                  <MovieCoverCard
                    title={title}
                    posterUrl={posterUrl}
                    onClick={() => { setSelectedId(m.id); setSelectedType('movie'); }}
                    selected={isSelected}
                  />
                </div>
              );
            })}
          </div>

          {/* Paginación: flechas arriba y números abajo a ≤528px */}
          <div className="flex items-center justify-between gap-2 mt-4 max-[528px]:flex-col max-[528px]:gap-3">
            {/* Grupo de flechas en móvil */}
            <div className="hidden max-[528px]:flex w-full justify-center gap-4 max-[528px]:gap-2">
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:px-1 max-[528px]:py-1 max-[528px]:text-[0.5rem]"
                onClick={() => setUiPage((p) => Math.max(1, p - 1))}
                disabled={uiPage <= 1}
                aria-label="Anterior"
                title="Anterior"
              >
                <span aria-hidden="true">{'<'}</span>
              </button>

              <button
                className="glass-button px-2 py-2 rounded max-[528px]:px-1 max-[528px]:py-1 max-[528px]:text-[0.5rem]"
                onClick={() => setUiPage((p) => Math.min(totalPagesUi, p + 1))}
                disabled={uiPage >= totalPagesUi}
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

            {/* Números */}
            <div className="flex items-center gap-2 justify-center w-full max-[528px]:gap-1 max-[528px]:text-[0.5rem]">
              <div className="flex items-center gap-1 max-[528px]:gap-1">
                {(() => {
                  // Mostrar solo 3 botones numéricos, excluyendo la última página del rango
                  const maxVisible = 3;
                  const lastPage = Math.max(1, totalPagesUi);
                  let startPage = Math.max(1, uiPage - 1);
                  let endPage = Math.min(lastPage - 1, uiPage + 1);

                  if (endPage < startPage) endPage = startPage;
                  const visible = endPage - startPage + 1;
                  if (visible < maxVisible) {
                    const deficit = maxVisible - visible;
                    endPage = Math.min(lastPage - 1, endPage + deficit);
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  const pages: number[] = [];
                  for (let p = startPage; p <= endPage; p++) pages.push(p);

                  return (
                    <>
                      {/* Ellipsis antes del rango si hay páginas previas */}
                      {startPage > 1 && <span className="text-neutral-500">…</span>}

                      {/* Rango visible */}
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

                      {/* Ellipsis después del rango si no llegamos a la última */}
                      {endPage < lastPage && <span className="text-neutral-500">…</span>}

                      {/* Última página */}
                      {uiPage < lastPage && (
                        <button
                          className="glass-button px-2 py-1 rounded text-neutral-300 max-[528px]:px-1 max-[528px]:py-0.5 max-[528px]:text-[0.5rem]"
                          onClick={() => setUiPage(lastPage)}
                        >
                          {lastPage}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Flecha derecha en desktop */}
            <button
              className="glass-button px-2 py-2 rounded max-[528px]:hidden"
              onClick={() => setUiPage((p) => Math.min(totalPagesUi, p + 1))}
              disabled={uiPage >= totalPagesUi}
              aria-label="Siguiente"
              title="Siguiente"
            >
              <span aria-hidden="true">{'>'}</span>
            </button>
          </div>
        </>
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

    </div>
  );
}