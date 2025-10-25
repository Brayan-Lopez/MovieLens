import type { TMDbSearchItem, MediaType } from '../types/movie';
import { MovieCoverCard } from './MovieCoverCard';

interface MovieListProps {
  items: TMDbSearchItem[];
  onSelect: (id: number, type: MediaType) => void;
  selectedId?: number;
}

const imgBase = 'https://image.tmdb.org/t/p/w342';

export function MovieList({ items, onSelect, selectedId }: MovieListProps) {
  const normalized = items
    .filter((i) => (i.media_type ?? (i.title ? 'movie' : i.name ? 'tv' : undefined)) !== undefined)
    .map((i) => {
      const type: MediaType = (i.media_type ?? (i.title ? 'movie' : 'tv')) as MediaType;
      const title = i.title ?? i.name ?? 'Sin título';
      const date = i.release_date ?? i.first_air_date ?? '';
      const year = date ? new Date(date).getFullYear() : '—';
      const poster = i.poster_path ? `${imgBase}${i.poster_path}` : '';
      return { ...i, type, title, year, poster };
    });

  if (!normalized.length) return <div className="text-neutral-400">No hay resultados.</div>;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4">
      {normalized.slice(0, 20).map((item) => (
        <div key={`${item.type}-${item.id}`} className="contents">
          <MovieCoverCard
            title={item.title}
            posterUrl={item.poster || undefined}
            onClick={() => onSelect(item.id, item.type)}
            selected={selectedId === item.id}
          />
        </div>
      ))}
    </div>
  );
}