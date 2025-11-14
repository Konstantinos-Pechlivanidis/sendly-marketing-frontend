import { clsx } from 'clsx';
import { forwardRef } from 'react';

const GlassInput = forwardRef(({
  label,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-4 py-3 rounded-md',
          'bg-neutral-surface-primary backdrop-blur-[24px]',
          'border border-neutral-border',
          'text-neutral-text-primary placeholder:text-neutral-text-secondary',
          'focus-ring focus:border-ice-primary focus:shadow-glow-ice-light',
          'transition-button',
          error && 'border-red-500 focus:border-red-500 focus:shadow-none',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;

