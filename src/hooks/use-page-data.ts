'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { safeFetch } from '@/lib/api/fetcher';
import { useVisitor } from '@/hooks/use-visitor';
import { ApiError } from '@/lib/utils/api-error';

interface UsePageDataOptions<T> {
  url: string;
  cacheKey: string;
  rateLimitKey?: string;
  skipDebounce?: boolean;
  // NEW: Add option to extract data from nested response
  dataPath?: string; // e.g., 'data.hero' to extract response.data.hero
}

interface UsePageDataResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  rateLimited: boolean;
  cooldownSeconds: number;
  refetch: () => void;
}

export function usePageData<T>({
  url,
  cacheKey,
  rateLimitKey = 'default',
  skipDebounce = false,
  dataPath, // Optional: path to extract data from response
}: UsePageDataOptions<T>): UsePageDataResult<T> {
  const { isReady, isBlocked, cooldownSeconds: visitorCooldown } = useVisitor();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const hasFetched = useRef(false);
  const isFetching = useRef(false);

  // Helper to extract data from nested response
  const extractData = useCallback(
    (responseData: any): T | null => {
      if (!responseData) return null;

      // If no dataPath specified, return data as-is
      if (!dataPath) return responseData;

      // Extract data using the specified path (e.g., 'data.hero')
      const pathParts = dataPath.split('.');
      let result = responseData;

      for (const part of pathParts) {
        if (result && typeof result === 'object' && part in result) {
          result = result[part];
        } else {
          console.warn(`[usePageData] Data path "${dataPath}" not found in response`);
          return null;
        }
      }

      return result;
    },
    [dataPath],
  );

  const fetchData = useCallback(async () => {
    if (isFetching.current) {
      console.log(`[usePageData] Already fetching ${url}, skipping`);
      return;
    }

    if (hasFetched.current && !skipDebounce) {
      console.log(`[usePageData] Already fetched ${url}, skipping`);
      return;
    }

    hasFetched.current = true;
    isFetching.current = true;

    setLoading(true);
    setError(null);
    setRateLimited(false);

    try {
      const result = await safeFetch<any>({
        // Use 'any' to handle different response structures
        url,
        method: 'GET',
        rateLimitKey,
        cacheKey,
        skipDebounce,
      });

      console.log(`[usePageData] Fetch result for ${url}:`, {
        blocked: result.blocked,
        rateLimited: result.rateLimited,
        error: result.error,
        hasData: !!result.data,
        dataStructure: result.data ? Object.keys(result.data) : 'no data',
      });

      if (result.blocked) {
        console.log(`[usePageData] Request blocked for ${url}`);
        setError(new ApiError('Request blocked', 429, 'BLOCKED'));
      } else if (result.rateLimited && result.error?.code === 'RATE_LIMITED') {
        setRateLimited(true);
        const seconds = parseInt(result.error.message.match(/\d+/)?.[0] || '5');
        setCooldownSeconds(seconds);
        setError(result.error);
      } else if (result.error) {
        setError(result.error);
      } else if (result.data) {
        // Check if response has standard API wrapper
        const responseData = result.data;

        // Handle different response structures
        if (responseData.success !== undefined && responseData.data !== undefined) {
          // Standard API response: { success: boolean, data: any, timestamp: string }
          if (responseData.success) {
            const extractedData = extractData(responseData.data);
            setData(extractedData);
          } else {
            setError(new ApiError('API returned unsuccessful response', 500, 'API_ERROR'));
          }
        } else {
          // Direct data response
          const extractedData = extractData(responseData);
          setData(extractedData);
        }
      } else {
        console.warn(`[usePageData] No data received from ${url}`);
        setError(new ApiError('No data received', 404, 'NO_DATA'));
      }
    } catch (err) {
      console.error(`[usePageData] Fetch error for ${url}:`, err);
      setError(err instanceof ApiError ? err : new ApiError('Fetch failed', 500, 'FETCH_ERROR'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [url, cacheKey, rateLimitKey, skipDebounce, extractData]);

  useEffect(() => {
    if (isReady && !isBlocked && !hasFetched.current) {
      fetchData();
    }
  }, [isReady, isBlocked, fetchData]);

  // Optional: Auto-retry if no data but no error
  useEffect(() => {
    if (isReady && !isBlocked && !data && !loading && !error) {
      const timer = setTimeout(() => {
        console.log(`[usePageData] Auto-retrying ${url}...`);
        hasFetched.current = false;
        fetchData();
      }, 3000); // Increased to 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isReady, isBlocked, data, loading, error, fetchData]);

  const refetch = useCallback(() => {
    console.log(`[usePageData] Manual refetch for ${url}`);
    hasFetched.current = false;
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading: loading || !isReady,
    error,
    rateLimited,
    cooldownSeconds: rateLimited ? cooldownSeconds : visitorCooldown,
    refetch,
  };
}
