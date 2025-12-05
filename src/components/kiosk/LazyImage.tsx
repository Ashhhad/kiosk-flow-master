// Lazy Image Component with LQIP (Low Quality Image Placeholder)
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackEmoji?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Generate srcset for responsive images
const generateSrcSet = (src: string) => {
  // In production, this would generate actual responsive URLs
  // For now, return the same src (would use image CDN in production)
  return src;
};

export const LazyImage = ({
  src,
  alt,
  className = '',
  fallbackEmoji = '🍽️',
  width,
  height,
  priority = false,
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before viewport
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* LQIP Placeholder / Shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-secondary animate-shimmer flex items-center justify-center">
          <span className="text-4xl opacity-50">{fallbackEmoji}</span>
        </div>
      )}

      {/* Fallback emoji if error */}
      {error && (
        <div className="absolute inset-0 bg-secondary flex items-center justify-center">
          <span className="text-6xl">{fallbackEmoji}</span>
        </div>
      )}

      {/* Actual image */}
      {inView && !error && (
        <motion.img
          src={src}
          srcSet={generateSrcSet(src)}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
};

// Category-specific fallback emojis
export const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'popular': '⭐',
    'burgers': '🍔',
    'chicken': '🍗',
    'sides': '🍟',
    'drinks': '🥤',
    'desserts': '🍦',
    'breakfast': '🍳',
    'salads': '🥗',
    'wraps': '🌯',
    'coffee': '☕',
  };
  return emojiMap[category] || '🍽️';
};
