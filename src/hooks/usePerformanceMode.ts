/**
 * usePerformanceMode - Detects low-performance scenarios and provides graceful degradation
 * 
 * Triggers low-perf mode when:
 * - User prefers reduced motion
 * - Device has limited CPU cores (< 4)
 * - FPS drops below threshold during scroll
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface PerformanceMode {
  isLowPerfMode: boolean;
  prefersReducedMotion: boolean;
  isLowEndDevice: boolean;
  shouldReduceAnimations: boolean;
  shouldDisableBlur: boolean;
  shouldSimplifyEffects: boolean;
}

// Singleton to track FPS across the app
const globalFpsMonitor: {
  isRunning: boolean;
  avgFps: number;
  subscribers: Set<(fps: number) => void>;
} = {
  isRunning: false,
  avgFps: 60,
  subscribers: new Set(),
};

function startFpsMonitor() {
  if (globalFpsMonitor.isRunning) return;
  globalFpsMonitor.isRunning = true;
  
  let frameCount = 0;
  let lastTime = performance.now();
  const fpsHistory: number[] = [];
  
  const measureFps = () => {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;
    
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      fpsHistory.push(fps);
      
      // Keep last 5 samples
      if (fpsHistory.length > 5) fpsHistory.shift();
      
      // Calculate average FPS
      globalFpsMonitor.avgFps = Math.round(
        fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length
      );
      
      // Notify subscribers
      globalFpsMonitor.subscribers.forEach(cb => cb(globalFpsMonitor.avgFps));
      
      frameCount = 0;
      lastTime = now;
    }
    
    if (globalFpsMonitor.subscribers.size > 0) {
      requestAnimationFrame(measureFps);
    } else {
      globalFpsMonitor.isRunning = false;
    }
  };
  
  requestAnimationFrame(measureFps);
}

export function usePerformanceMode(): PerformanceMode {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isLowFps, setIsLowFps] = useState(false);
  const mountedRef = useRef(true);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      if (mountedRef.current) {
        setPrefersReducedMotion(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => {
      mountedRef.current = false;
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  // Check device capabilities
  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const isLowEnd = cores < 4;
    
    // Also check for mobile devices with limited memory
    const isLowMemory = 'deviceMemory' in navigator && 
      (navigator as { deviceMemory?: number }).deviceMemory !== undefined &&
      (navigator as { deviceMemory?: number }).deviceMemory! < 4;
    
    setIsLowEndDevice(isLowEnd || isLowMemory);
  }, []);

  // Subscribe to FPS monitor
  const handleFpsUpdate = useCallback((fps: number) => {
    if (mountedRef.current) {
      setIsLowFps(fps < 45); // Threshold for triggering low-perf mode
    }
  }, []);

  useEffect(() => {
    globalFpsMonitor.subscribers.add(handleFpsUpdate);
    startFpsMonitor();
    
    return () => {
      globalFpsMonitor.subscribers.delete(handleFpsUpdate);
    };
  }, [handleFpsUpdate]);

  // Derive performance mode flags
  const isLowPerfMode = prefersReducedMotion || isLowEndDevice || isLowFps;
  
  return {
    isLowPerfMode,
    prefersReducedMotion,
    isLowEndDevice,
    shouldReduceAnimations: isLowPerfMode,
    shouldDisableBlur: isLowEndDevice || isLowFps,
    shouldSimplifyEffects: isLowPerfMode,
  };
}

// Lightweight hook for components that only need the boolean
export function useShouldReduceMotion(): boolean {
  const [shouldReduce, setShouldReduce] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduce(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setShouldReduce(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return shouldReduce;
}
