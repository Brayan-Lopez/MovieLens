import { useEffect, useState } from 'react';
import { useSearchItemsQuery } from '../store/api/moviesApi';
import { MovieList } from './MovieList';
import { MovieDetail } from './MovieDetail';
import type { MediaType } from '../types/movie';
import { SkeletonCard } from './SkeletonCard'

export function MoviesExplorer() {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDetailType, setSelectedDetailType] = useState<MediaType | null>(null);
  const [selectedType, setSelectedType] = useState<'movie'|'tv'|'multi'|undefined>(undefined);
  const [page, setPage] = useState(1);

  // Debounce del término de búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 500);
    return () => clearTimeout(t);
  }, [term]);

  // Reset de página cuando cambia el término o la categoría
  useEffect(() => {
    setPage(1);
  }, [debounced, selectedType]);

  // Si no hay término, pero sí categoría, usamos un término genérico para listar
  const effectiveTerm = debounced.trim() || (selectedType ? 'a' : '');
  const searchType = selectedType ?? 'multi';

  const { data, error, isLoading, isFetching } = useSearchItemsQuery(
    { query: effectiveTerm, page, type: searchType },
    { skip: !effectiveTerm }
  );

  return (
    <div className="space-y-3">
      <h1 className="text-lg sm:text-xl font-bold">Buscador TMDb</h1>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Escribe un título..."
        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded glass-input"
      />

      {/* Grid de categorías */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2 sm:gap-3 mb-4">
        <button onClick={() => setSelectedType('multi')} className="glass-button px-3 py-2 rounded">Todos</button>
        <button onClick={() => setSelectedType('movie')} className="glass-button px-3 py-2 rounded">Película</button>
        <button onClick={() => setSelectedType('tv')} className="glass-button px-3 py-2 rounded">Serie</button>
        <button onClick={() => setSelectedType(undefined)} className="glass-button px-3 py-2 rounded">Borrar filtro</button>
      </div>

      {!debounced.trim() && !selectedType && <div className="text-neutral-400">Escribe algo para buscar o elige una categoría.</div>}
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
        <div className="text-red-400">
          Ocurrió un error al buscar. {(() => {
            const e = error as any;
            const msg = e?.data?.status_message || e?.data?.message || e?.status;
            return msg ? `(${String(msg)})` : null;
          })()}
        </div>
      )}

      {data?.results && (
        <> 
          <div className="mb-2 text-sm text-neutral-300">
            <strong>Resultados:</strong> {data.total_results}
            {isFetching && <span className="ml-2 text-neutral-500">(actualizando...)</span>}
            <span className="ml-2">• Página {page} de {Math.min(data.total_pages, 500)}</span>
          </div>
          <MovieList 
            items={data.results} 
            onSelect={(id, type) => { setSelectedId(id); setSelectedDetailType(type); }} 
            selectedId={selectedId ?? undefined}
          />

          {/* Paginación: flechas arriba y números abajo a ≤528px */}
          {typeof data.total_pages === 'number' && (
            <div className="flex items-center justify-between gap-2 mt-4 max-[528px]:flex-col max-[528px]:gap-3">
              {/* Grupo de flechas en móvil */}
              <div className="hidden max-[528px]:flex w-full justify-center gap-4 max-[528px]:gap-2">
                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:px-1 max-[528px]:py-1 max-[528px]:text-[0.5rem]"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Anterior"
                  title="Anterior"
                >
                  <span aria-hidden="true">{'<'}</span>
                </button>

                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:px-1 max-[528px]:py-1 max-[528px]:text-[0.5rem]"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  aria-label="Primera"
                  title="Primera"
                >
                  <span aria-hidden="true">{'<<'}</span>
                </button>

                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:px-1 max-[528px]:py-1 max-[528px]:text-[0.5rem]"
                  onClick={() => setPage(Math.min(data.total_pages, 500))}
                  disabled={page >= Math.min(data.total_pages, 500)}
                  aria-label="Última"
                  title="Última"
                >
                  <span aria-hidden="true">{'>>'}</span>
                </button>

                <button
                  className="glass-button px-2 py-2 rounded max-[528px]:px-1 max-[528px]:py-1 max-[528px]:text-[0.5rem]"
                  onClick={() => setPage((p) => Math.min(Math.min(data.total_pages, 500), p + 1))}
                  disabled={page >= Math.min(data.total_pages, 500)}
                  aria-label="Siguiente"
                  title="Siguiente"
                >
                  <span aria-hidden="true">{'>'}</span>
                </button>
              </div>

              {/* Flecha izquierda en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Anterior"
                title="Anterior"
              >
                <span aria-hidden="true">{'<'}</span>
              </button>

              {/* Primera página en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setPage(1)}
                disabled={page <= 1}
                aria-label="Primera"
                title="Primera"
              >
                <span aria-hidden="true">{'<<'}</span>
              </button>

              {/* Números */}
              <div className="flex items-center gap-2 justify-center w-full max-[528px]:gap-1 max-[528px]:text-[0.5rem]">
                <div className="flex items-center gap-1 max-[528px]:gap-1">
                  {(() => {
                    const maxVisible = 4;
                    const lastPage = Math.max(1, Math.min(data.total_pages, 500));
                    let startPage = Math.max(1, Math.min(page - 1, Math.max(1, (lastPage - 1) - (maxVisible - 1))));
                    let endPage = Math.min(lastPage - 1, startPage + (maxVisible - 1));

                    const pages: number[] = [];
                    if (lastPage > 1) {
                      for (let p = startPage; p <= endPage; p++) pages.push(p);
                    }

                    return (
                      <>
                        {pages.map((p) => (
                          p === page ? (
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
                              onClick={() => setPage(p)}
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
                onClick={() => setPage(Math.min(data.total_pages, 500))}
                disabled={page >= Math.min(data.total_pages, 500)}
                aria-label="Última"
                title="Última"
              >
                <span aria-hidden="true">{'>>'}</span>
              </button>

              {/* Flecha derecha en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setPage((p) => Math.min(Math.min(data.total_pages, 500), p + 1))}
                disabled={page >= Math.min(data.total_pages, 500)}
                aria-label="Siguiente"
                title="Siguiente"
              >
                <span aria-hidden="true">{'>'}</span>
              </button>
            </div>
          )}
        </>
      )}

      {selectedId && selectedDetailType && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedId(null); setSelectedDetailType(null); }}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-4xl glass-panel rounded-lg p-6">
            <button
              onClick={() => { setSelectedId(null); setSelectedDetailType(null); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full glass-button text-neutral-300 hover:text-white transition-colors"
              aria-label="Cerrar detalles"
            >
              ×
            </button>
            <MovieDetail
              id={selectedId}
              type={selectedDetailType}
              onClose={() => { setSelectedId(null); setSelectedDetailType(null); }}
              showCloseButton={false}
              imageHalf={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}