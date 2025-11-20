import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

/**
 * LoadingState Component
 * Standardized loading wrapper with consistent styling
 * iOS 26 style with proper spacing and background
 */
export default function LoadingState({
  size = 'lg',
  message,
  className,
  fullScreen = true,
  height,
  width,
}) {
  const content = (
    <div 
      className={clsx('flex flex-col items-center justify-center gap-4', className)}
      style={height ? { minHeight: height, width: width || '100%' } : undefined}
      aria-live="polite"
      aria-label={message || 'Loading content'}
    >
      <LoadingSpinner size={size} />
      {message && (
        <p className="text-sm text-neutral-text-secondary">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-base">
        {content}
      </div>
    );
  }

  return content;
}

