"use client";
import { useState, useCallback } from "react";

interface RateLimitState {
  isRateLimited: boolean;
  retryAfter: number;
}

export const useRateLimitHandler = () => {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: 0,
  });

  const handleRateLimitResponse = useCallback(async (response: Response) => {
    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      
      if (data.showPopup) {
        setRateLimitState({
          isRateLimited: true,
          retryAfter: data.retryAfter || 60,
        });
      }
      
      return true;
    }
    return false;
  }, []);

  const closeRateLimitPopup = useCallback(() => {
    setRateLimitState({
      isRateLimited: false,
      retryAfter: 0,
    });
  }, []);

  return {
    rateLimitState,
    handleRateLimitResponse,
    closeRateLimitPopup,
  };
};
