
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
  loadImmediately?: boolean; // Thêm tùy chọn để load ngay
}

export const LazyImage = ({
  src,
  alt,
  placeholderSrc = '/placeholder.svg',
  threshold = 0.1,
  rootMargin = '200px 0px',
  loadImmediately = false, // Mặc định không load ngay
  className,
  ...props
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Hàm tải hình ảnh
  const loadImage = () => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoaded(true);
      
      // Khi đã load xong, không cần quan sát nữa
      if (imgRef.current && observerRef.current) {
        observerRef.current.unobserve(imgRef.current);
        observerRef.current = null;
      }
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      // Giữ placeholder khi có lỗi
    };
  };

  useEffect(() => {
    // Load ngay lập tức nếu được yêu cầu (hình ảnh quan trọng)
    if (loadImmediately) {
      loadImage();
      return;
    }

    // Dọn dẹp observer trước đó nếu có
    if (observerRef.current) {
      if (imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
      observerRef.current = null;
    }

    // Bỏ qua nếu đã load hình ảnh
    if (loaded && imageSrc === src) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        loadImage();
      }
    };

    // Tạo observer mới
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold,
    });

    // Bắt đầu quan sát
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      // Dọn dẹp observer khi unmount
      if (observerRef.current) {
        if (imgRef.current) {
          observerRef.current.unobserve(imgRef.current);
        }
        observerRef.current = null;
      }
    };
  }, [src, loaded, imageSrc, threshold, rootMargin, loadImmediately]);

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
