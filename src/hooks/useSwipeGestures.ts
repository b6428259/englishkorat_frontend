"use client";

import { useEffect, useRef } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullDown?: () => void;
}

export const useSwipeGestures = (handlers: SwipeHandlers) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const minSwipeDistance = 50;
  const pullThreshold = 100;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;

    // Pull to refresh detection
    if (
      handlers.onPullDown &&
      window.scrollY === 0 &&
      touchEndY.current - touchStartY.current > pullThreshold
    ) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    const horizontalDistance = touchStartX.current - touchEndX.current;
    const verticalDistance = touchStartY.current - touchEndY.current;
    const isHorizontalSwipe =
      Math.abs(horizontalDistance) > Math.abs(verticalDistance);

    if (isHorizontalSwipe) {
      // Horizontal swipe
      if (Math.abs(horizontalDistance) > minSwipeDistance) {
        if (horizontalDistance > 0) {
          // Swiped left
          handlers.onSwipeLeft?.();
        } else {
          // Swiped right
          handlers.onSwipeRight?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(verticalDistance) > minSwipeDistance) {
        if (verticalDistance > 0) {
          // Swiped up
          handlers.onSwipeUp?.();
        } else if (verticalDistance < -pullThreshold && window.scrollY === 0) {
          // Swiped down (pull to refresh)
          handlers.onPullDown?.();
        }
      }
    }

    // Reset
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
  };

  useEffect(() => {
    const element = document.body;

    element.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers]);
};
