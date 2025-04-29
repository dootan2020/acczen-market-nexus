import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
}

export const LazyImage = ({
  src,
  alt,
  placeholderSrc = '/placeholder.svg',
  className,
  ...props
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoaded(true);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      // Keep placeholder image on error
    };
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300 ease-in-out',
        !loaded && 'opacity-40 blur-[2px]',
        loaded && 'opacity-100',
        className
      )}
      {...props}
    />
  );
};

export default LazyImage;
