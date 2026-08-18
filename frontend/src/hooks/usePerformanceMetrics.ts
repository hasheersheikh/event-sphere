import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  loadTime?: number;
}

/**
 * Hook to monitor Web Vitals and custom performance metrics
 * Reports to console in development, can be extended to send to analytics
 */
export function usePerformanceMetrics(reportToAnalytics?: (metrics: PerformanceMetrics) => void) {
  const metricsRef = useRef<PerformanceMetrics>({});
  const hasReported = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measureMetrics();
    } else {
      window.addEventListener('load', measureMetrics);
    }

    return () => {
      window.removeEventListener('load', measureMetrics);
    };
  }, []);

  const measureMetrics = () => {
    const perfData = window.performance;
    const navigation = perfData.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) return;

    // Basic timing metrics
    metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart;
    metricsRef.current.loadTime = navigation.loadEventEnd - navigation.navigationStart;

    // First Contentful Paint
    const fcpEntry = perfData.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
    if (fcpEntry) {
      metricsRef.current.fcp = fcpEntry.startTime;
    }

    // Largest Contentful Paint (needs observer)
    observeLCP();

    // First Input Delay (needs observer)
    observeFID();

    // Cumulative Layout Shift (needs observer)
    observeCLS();

    // Report metrics after delay to capture all values
    setTimeout(() => {
      if (!hasReported.current && reportToAnalytics) {
        hasReported.current = true;
        reportToAnalytics(metricsRef.current);
      }

      // Log in development
      if (import.meta.env.DEV) {
        console.group('🚀 Performance Metrics');
        console.log('TTFB:', metricsRef.current.ttfb, 'ms');
        console.log('FCP:', metricsRef.current.fcp, 'ms');
        console.log('LCP:', metricsRef.current.lcp, 'ms');
        console.log('FID:', metricsRef.current.fid, 'ms');
        console.log('CLS:', metricsRef.current.cls);
        console.log('Load Time:', metricsRef.current.loadTime, 'ms');
        console.groupEnd();
      }
    }, 3000);
  };

  const observeLCP = () => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metricsRef.current.lcp = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }
  };

  const observeFID = () => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as any;
        metricsRef.current.fid = firstEntry.processingStart - firstEntry.startTime;
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }
  };

  const observeCLS = () => {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        metricsRef.current.cls = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  };

  return metricsRef.current;
}

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string) {
  const renderStart = useRef<number>();

  useEffect(() => {
    renderStart.current = performance.now();

    return () => {
      const renderTime = performance.now() - (renderStart.current || 0);
      if (import.meta.env.DEV && renderTime > 16) {
        console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}
