import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blurDataURL?: string;
}

/**
 * Optimized Image Component with:
 * - Lazy loading (unless priority)
 * - WebP support with fallback
 * - Blur-up placeholder
 * - Progressive loading
 * - Intersection Observer for viewport detection
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  blurDataURL,
  className,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Start loading 50px before entering viewport
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Generate WebP and fallback sources
  const generateSources = (originalSrc: string) => {
    // If it's already an external URL (Cloudinary), return as-is
    if (originalSrc.startsWith('http')) {
      return {
        webp: originalSrc.includes('cloudinary')
          ? originalSrc.replace('/upload/', '/upload/f_auto,q_auto/')
          : originalSrc,
        original: originalSrc,
      };
    }

    // For local images, construct WebP path
    const baseName = originalSrc.replace(/\.(jpg|jpeg|png)$/, '');
    return {
      webp: `${baseName}.webp`,
      original: originalSrc,
    };
  };

  const sources = generateSources(src);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      <img
        ref={imgRef}
        src={isInView ? (blurDataURL || sources.original) : undefined}
        data-src={isInView ? sources.original : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{
          filter: !isLoaded && blurDataURL ? 'blur(10px)' : undefined,
        }}
        {...props}
      />

      {/* Progressively load WebP if supported */}
      {isInView && (
        <picture className="absolute inset-0">
          <source
            srcSet={sources.webp}
            type="image/webp"
          />
          <img
            src={sources.original}
            alt={alt}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-0' : 'opacity-0'
            )}
            style={{ position: 'absolute', visibility: 'hidden' }}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;
