import { useEffect, useState } from 'react';
import { useSearchItemsQuery } from '../store/api/moviesApi';
import { MovieList } from './MovieList';
import { MovieDetail } from './MovieDetail';
import type { MediaType } from '../types/movie';
import { SkeletonCard } from './SkeletonCard'
import { useDispatch, useSelector } from 'react-redux';
import { setSearchState, clearSearchState, setFilters } from '../store/uiSlice';
import type { RootState } from '../store';

const GENRES: Array<{ id: number; name: string }> = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familia' },
  { id: 14, name: 'Fantasía' },
  { id: 36, name: 'Historia' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Misterio' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ciencia Ficción' },
  { id: 10770, name: 'Película de TV' },
  { id: 53, name: 'Suspenso' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Western' },
];

const YEARS = Array.from({ length: 45 }, (_, i) => 2024 - i);
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'ja', 'ko', 'pt'];

export function MoviesExplorer() {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDetailType, setSelectedDetailType] = useState<MediaType | null>(null);
  const [selectedType, setSelectedType] = useState<'movie'|'tv'|'multi'|undefined>(undefined);
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const filters = useSelector((s: RootState) => s.ui.filters);

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

  // Actualiza el estado global de resultados para que FeaturedMovies pueda consumirlos
  useEffect(() => {
    if (!effectiveTerm) {
      dispatch(clearSearchState());
      return;
    }
    if (data) {
      dispatch(setSearchState({
        query: effectiveTerm,
        type: searchType,
        page,
        totalResults: data.total_results ?? 0,
        results: data.results ?? [],
      }));
    }
  }, [effectiveTerm, searchType, page, data, dispatch]);

  // Handlers de filtros
  const updateFilters = (next: Partial<typeof filters>) => {
    dispatch(setFilters({
      ...filters,
      ...next,
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      <h1 className="m-0 mb-3 sm:mb-4 !text-[1.2rem] sm:!text-[1.6rem] lg:!text-[2rem] leading-[1.2] font-bold">Término de búsqueda:</h1>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Escribe un título..."
        className="mt-1 sm:mt-2 w-full h-9 px-2 text-sm rounded glass-button"
      />

      {/* Filtros */}

      <div className="flex flex-wrap w-fit mx-auto lg:w-full lg:mx-0 gap-2 sm:gap-3 mt-2 justify-center">
        <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]">
          <label className="block text-sm mb-1">Calidad:</label>
          <select
            className="w-full h-9 px-2 text-sm rounded glass-button max-w-[160px] min-w-[120px] sm:min-w-[140px] lg:max-w-none"
            value={filters.quality}
            onChange={(e) => updateFilters({ quality: e.target.value as any })}
          >
            <option value="all">Todos</option>
            <option value="high">Alta (≥ 7.0)</option>
            <option value="medium">Media (5–6.9)</option>
            <option value="low">Baja (&lt; 5.0)</option>
          </select>
        </div>
        <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]">
          <label className="block text-sm mb-1">Género:</label>
          <select
            className="w-full h-9 px-2 text-sm rounded glass-button max-w-[160px] min-w-[120px] sm:min-w-[140px] lg:max-w-none"
            value={filters.genreId === 'all' ? 'all' : String(filters.genreId)}
            onChange={(e) => updateFilters({ genreId: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
          >
            <option value="all">Todos</option>
            {GENRES.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]">
          <label className="block text sm mb-1">Clasificación:</label>
          <select
            className="w-full h-9 px-2 text-sm rounded glass-button max-w-[160px] min-w-[120px] sm:min-w-[140px] lg:max-w-none"
            value={filters.classification}
            onChange={(e) => updateFilters({ classification: e.target.value as any })}
          >
            <option value="all">Todos</option>
            <option value="no_adult">No adulto</option>
            <option value="adult">Adulto</option>
          </select>
        </div>
        <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]">
          <label className="block text-sm mb-1">Año:</label>
          <select
            className="w-full h-9 px-2 text-sm rounded glass-button max-w-[160px] min-w-[120px] sm:min-w-[140px] lg:max-w-none"
            value={filters.year === 'all' ? 'all' : String(filters.year)}
            onChange={(e) => updateFilters({ year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
          >
            <option value="all">Todos</option>
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]">
          <label className="block text-sm mb-1">Idioma:</label>
          <select
            className="w-full h-9 px-2 text-sm rounded glass-button max-w-[160px] min-w-[120px] sm:min-w-[140px] lg:max-w-none"
            value={filters.language === 'all' ? 'all' : filters.language}
            onChange={(e) => updateFilters({ language: e.target.value === 'all' ? 'all' : e.target.value })}
          >
            <option value="all">Todos</option>
            {LANGS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]">
          <label className="block text-sm mb-1">Ordenar por:</label>
          <select
            className="w-full h-9 px-2 text-sm rounded glass-button max-w-[160px] min-w-[120px] sm:min-w-[140px] lg:max-w-none"
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
          >
            <option value="recent">Más reciente</option>
            <option value="rating">Mejor calificada</option>
            <option value="popularity">Popularidad</option>
            <option value="title_asc">Título A–Z</option>
          </select>
        </div>
      </div>

      {/* Grid de categorías rápidas */}
      <div className="flex flex-wrap w-fit mx-auto lg:w-full lg:mx-0 gap-2 sm:gap-3 mb-4 justify-center">
      <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]"><button onClick={() => setSelectedType('multi')} className="glass-button px-3 py-2 rounded w-full">Todos</button></div>
      <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]"><button onClick={() => setSelectedType('movie')} className="glass-button px-3 py-2 rounded w-full">Película</button></div>
      <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]"><button onClick={() => setSelectedType('tv')} className="glass-button px-3 py-2 rounded w-full">Serie</button></div>
      <div className="lg:flex-1 min-w-[120px] sm:min-w-[140px]"><button onClick={() => setSelectedType(undefined)} className="glass-button px-3 py-2 rounded w-full">Borrar filtro</button></div>
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

      {data && (
        <>
          <div className="mb-2 text-sm text-neutral-300">
            <strong>Resultados:</strong> {data.total_results}
            {isFetching && <span className="ml-2 text-neutral-500">(actualizando...)</span>}
          </div>

          <MovieList
            items={(data.results ?? []) as any}
            onSelect={(id, type) => { setSelectedId(id); setSelectedDetailType(type); }}
            selectedId={selectedId ?? undefined}
          />

          {/* Paginación: flechas arriba y números abajo a ≤528px */}
          {typeof data.total_pages === 'number' && (
            <div className="flex items-center justify-center gap-2 mt-4 max-[528px]:flex-col max-[528px]:gap-3 mx-auto">
              {/* Grupo de flechas en móvil */}
              <div className="hidden max-[528px]:flex w-full justify-center gap-4 max-[528px]:gap-2">
                <button
                  className="glass-button w-8 h-8 p-0 rounded text-xs"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Anterior"
                  title="Anterior"
                >
                  <span aria-hidden="true">{'<'}</span>
                </button>

                <button
                  className="glass-button w-8 h-8 p-0 rounded text-xs"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  aria-label="Primera"
                  title="Primera"
                >
                  <span aria-hidden="true">{'<<'}</span>
                </button>

                <button
                  className="glass-button w-8 h-8 p-0 rounded text-xs"
                  onClick={() => setPage(Math.min(data?.total_pages ?? 1, 500))}
                  disabled={page >= Math.min(data?.total_pages ?? 1, 500)}
                  aria-label="Última"
                  title="Última"
                >
                  <span aria-hidden="true">{'>>'}</span>
                </button>

                <button
                  className="glass-button w-8 h-8 p-0 rounded text-xs"
                  onClick={() => setPage((p) => Math.min(Math.min(data?.total_pages ?? 1, 500), p + 1))}
                  disabled={page >= Math.min(data?.total_pages ?? 1, 500)}
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
              <div className="flex items-center gap-2 justify-center max-[528px]:gap-1 max-[528px]:text-[0.75rem]">
                <div className="flex items-center gap-1">
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
                              className="glass-button w-8 h-8 p-0 rounded font-semibold cursor-default flex items-center justify-center"
                              style={{ color: '#646cff', borderColor: '#646cff' }}
                            >
                              {p}
                            </button>
                          ) : (
                            <button
                              key={`page-${p}`}
                              className="glass-button w-8 h-8 p-0 rounded text-neutral-300 flex items-center justify-center"
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
                onClick={() => setPage(Math.min(data?.total_pages ?? 1, 500))}
                disabled={page >= Math.min(data?.total_pages ?? 1, 500)}
                aria-label="Última"
                title="Última"
              >
                <span aria-hidden="true">{'>>'}</span>
              </button>

              {/* Flecha derecha en desktop */}
              <button
                className="glass-button px-2 py-2 rounded max-[528px]:hidden"
                onClick={() => setPage((p) => Math.min(Math.min(data?.total_pages ?? 1, 500), p + 1))}
                disabled={page >= Math.min(data?.total_pages ?? 1, 500)}
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