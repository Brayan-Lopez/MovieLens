interface MovieCoverCardProps {
  title: string;
  posterUrl?: string;
  onClick?: () => void;
  selected?: boolean;
}

import ImageWithSpinner from './ImageWithSpinner';

export function MovieCoverCard({ title, posterUrl, onClick, selected = false }: MovieCoverCardProps) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >
      <div className={"group overflow-hidden glass-card h-80 sm:h-96 md:h-[26rem] flex flex-col rounded-lg"} style={selected ? { borderColor: '#646cff', borderWidth: '3px', borderStyle: 'solid' } : {}}>
         <div className="flex-1 min-h-0">
           <ImageWithSpinner
             src={posterUrl}
             alt={title}
             containerClassName="w-full h-full"
             imgClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
           />
         </div>
         <div className="p-2 sm:p-3 h-16 sm:h-20 flex items-center">
           <h3 className="m-0 text-sm sm:text-base font-medium text-neutral-100 line-clamp-2 overflow-hidden text-ellipsis">{title}</h3>
         </div>
       </div>
    </div>
  );
}