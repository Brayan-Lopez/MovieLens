import { useState, useEffect } from 'react';
import { Spinner } from './Spinner';

interface ImageWithSpinnerProps {
  src?: string;
  alt: string;
  imgClassName?: string;
  containerClassName?: string;
}

export default function ImageWithSpinner({ src, alt, imgClassName = '', containerClassName = '' }: ImageWithSpinnerProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // If there is no src, show permanent spinner
  useEffect(() => {
    if (!src) {
      setLoaded(false);
      setError(true);
    } else {
      setLoaded(false);
      setError(false);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${containerClassName}`}>
      {src && !error && (
        <img
          src={src}
          alt={alt}
          className={`block ${imgClassName}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* Spinner overlay while loading or permanently if error */}
      {(!loaded || error) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
}