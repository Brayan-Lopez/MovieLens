import { useEffect, useId, useRef, useState } from 'react';

interface CollapsibleSynopsisProps {
  text: string;
  initialLines?: number; // Número de líneas visibles en modo colapsado
  className?: string;
  moreLabel?: string; // Texto del botón para expandir
  lessLabel?: string; // Texto del botón para contraer
  id?: string; // Id opcional para aria-controls
}

export default function CollapsibleSynopsis({
  text,
  initialLines = 2,
  className = '',
  moreLabel = 'Ver más',
  lessLabel = 'Ver menos',
  id,
}: CollapsibleSynopsisProps) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [lineHeightPx, setLineHeightPx] = useState<number>(0);
  const [expandedHeightPx, setExpandedHeightPx] = useState<number>(0);
  const internalId = useId();
  const contentId = id ?? `synopsis-${internalId}`;

  const pRef = useRef<HTMLParagraphElement | null>(null);
  const measureRef = useRef<HTMLParagraphElement | null>(null);

  const clampClass = expanded ? '' : `line-clamp-${initialLines}`;

  // Medición de overflow y alturas para transición
  useEffect(() => {
    const measure = () => {
      const el = measureRef.current;
      if (!el) return;
      const style = getComputedStyle(el);
      let lh = parseFloat(style.lineHeight || '0');
      if (!lh || Number.isNaN(lh)) {
        const fs = parseFloat(style.fontSize || '16');
        lh = fs * 1.4; // fallback razonable
      }
      setLineHeightPx(lh);
      const naturalHeight = el.scrollHeight; // altura total del contenido
      setExpandedHeightPx(naturalHeight);
      const lines = lh > 0 ? Math.ceil(naturalHeight / lh) : 0;
      const clamped = lines > initialLines;
      setIsClamped(clamped);
      if (!clamped && expanded) setExpanded(false);
    };

    measure();

    let t: number | undefined;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(measure, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (t) window.clearTimeout(t);
    };
  }, [text, initialLines, expanded]);

  const collapsedHeightPx = lineHeightPx * initialLines;
  const animatedMaxHeight = expanded ? expandedHeightPx : collapsedHeightPx;

  const isVeryShort = (text?.trim().length || 0) <= 60; // ~1 línea

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Contenedor animado por max-height */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out synopsis-area ${isVeryShort ? 'synopsis-area--short' : ''}`}
        style={{ maxHeight: `${animatedMaxHeight}px`, willChange: 'max-height' }}
      >
        <p
          ref={pRef}
          id={contentId}
          className={`text-sm md:text-base text-neutral-200 ${clampClass} ${className} ${isVeryShort ? 'synopsis-short-text' : ''}`}
        >
          {text}
          {isVeryShort && (
            <span className="synopsis-placeholder" aria-hidden="true">Sinopsis breve</span>
          )}
        </p>
      </div>

      {/* Elemento de medición invisible, misma tipografía/tamaño para medir líneas reales */}
      <p
        ref={measureRef}
        className={`invisible absolute left-0 right-0 text-sm md:text-base ${className}`}
      >
        {text}
      </p>

      {isClamped && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-xs sm:text-sm px-2 py-1 rounded glass-button hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neutral-500"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}