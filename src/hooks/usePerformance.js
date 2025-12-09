import { useEffect } from 'react';
import { ApiLogger } from '../utils/apiLogger.js';

export const usePerformance = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      ApiLogger.performance(componentName, duration);
    };
  }, [componentName]);
};

export const useMountTime = (componentName) => {
  useEffect(() => {
    const mountTime = performance.now();
    console.log(`🚀 ${componentName} mounted at ${mountTime}ms`);
  }, [componentName]);
};

export const useRenderTime = (componentName, dependencies = []) => {
  useEffect(() => {
    const renderStart = performance.now();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      const duration = renderEnd - renderStart;
      
      if (import.meta.env?.VITE_ENABLE_DEBUG === 'true' || 
          import.meta.env?.MODE === 'development') {
        console.log(`🎨 ${componentName} rendered in ${duration.toFixed(2)}ms`);
      }
    });
  }, dependencies);
};