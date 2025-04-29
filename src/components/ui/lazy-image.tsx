import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage = ({
  src,
  alt,
  placeholderSrc = '/placeholder.svg',
  threshold = 0.1,
  rootMargin = '200px 0px',
  className,
  ...props
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Clean up previous observer if exists
    if (observerRef.current) {
      if (imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
      observerRef.current = null;
    }

    // Skip if image is already loaded
    if (loaded && imageSrc === src) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // Load the actual image
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setImageSrc(src);
          setLoaded(true);
          
          // Once loaded, no need to observe anymore
          if (imgRef.current && observerRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          // Keep placeholder image on error
        };
      }
    };

    // Create observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold,
    });

    // Start observing
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      // Clean up observer on component unmount
      if (observerRef.current) {
        if (imgRef.current) {
          observerRef.current.unobserve(imgRef.current);
        }
        observerRef.current = null;
      }
    };
  }, [src, loaded, imageSrc, threshold, rootMargin]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300 ease-in-out',
        !loaded && 'opacity-40 blur-[2px]',
        loaded && 'opacity-100',
        className
      )}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

export default LazyImage;
