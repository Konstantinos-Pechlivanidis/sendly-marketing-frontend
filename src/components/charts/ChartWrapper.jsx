import { Suspense } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Chart Wrapper Component
 * Wraps lazy-loaded charts with Suspense for better code splitting
 * Prevents layout shift by reserving space for charts
 */
export default function ChartWrapper({ children, height = 300 }) {
  return (
    <Suspense fallback={
      <div 
        className="flex items-center justify-center" 
        style={{ minHeight: `${height}px`, width: '100%' }}
        aria-label="Loading chart"
      >
        <LoadingSpinner size="md" />
      </div>
    }>
      {children}
    </Suspense>
  );
}
