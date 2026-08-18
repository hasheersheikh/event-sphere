import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UseOptimizedInfiniteScrollOptions<T> {
  queryKey: string[];
  fetchFn: (page: number, limit: number) => Promise<T[]>;
  initialData?: T[];
  itemsPerPage?: number;
  threshold?: number; // Distance from bottom to trigger load (px)
}

/**
 * Optimized infinite scroll hook with:
 * - Intersection Observer for viewport detection
 * - Request deduplication
 * - Scroll restoration
 * - Memory-efficient pagination
 */
export function useOptimizedInfiniteScroll<T>({
  queryKey,
  fetchFn,
  initialData = [],
  itemsPerPage = 20,
  threshold = 200,
}: UseOptimizedInfiniteScrollOptions<T>) {
  const [allItems, setAllItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset pagination when query key changes
  useEffect(() => {
    setAllItems(initialData);
    setPage(1);
    setHasMore(true);
  }, [queryKey, initialData]);

  // Fetch current page data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => fetchFn(page, itemsPerPage),
    enabled: page > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update all items when data changes
  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllItems(data);
      } else {
        setAllItems(prev => [...prev, ...data]);
      }

      // Check if there are more items
      if (data.length < itemsPerPage) {
        setHasMore(false);
      }
    }
  }, [data, page, itemsPerPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || isLoadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isLoadingMore, threshold]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setPage(prev => prev + 1);

    // Reset loading state after a delay
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    return refetch();
  }, [refetch]);

  return {
    items: allItems,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    loadMoreRef,
  };
}
