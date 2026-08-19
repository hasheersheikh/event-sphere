import { useState, useRef, useLayoutEffect, ImgHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevealImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Swapped in via onError instead of showing a broken image */
  fallback?: string;
  /** Centered spinner over the nearest positioned ancestor while loading */
  spinner?: boolean;
}

/**
 * Image that stays invisible until it has fully downloaded, then fades in —
 * replaces the browser's progressive top-to-bottom paint with a loader and a
 * clean reveal. The optional spinner overlay anchors to the nearest
 * positioned ancestor.
 */
const RevealImage = ({
  src,
  fallback,
  spinner = false,
  className,
  onLoad,
  onError,
  ...props
}: RevealImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A changed src must restart the reveal — reset during render so the old
  // image never flashes at full opacity before an effect can hide it.
  if (currentSrc !== src) {
    setCurrentSrc(src);
    setLoaded(false);
    setErrored(false);
  }

  // Images served from the memory cache can finish before handlers attach
  useLayoutEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [currentSrc]);

  return (
    <>
      <img
        ref={imgRef}
        src={errored && fallback ? fallback : currentSrc}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          if (fallback) setErrored(true);
          onError?.(event);
        }}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
      {spinner && !loaded && (
        <span
          aria-hidden
          className="absolute inset-0 z-10 flex items-center justify-center bg-muted pointer-events-none"
        >
          <Loader2 className="h-7 w-7 animate-spin text-foreground/40" />
        </span>
      )}
    </>
  );
};

export default RevealImage;
