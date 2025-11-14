import { clsx } from 'clsx';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import Icon from './Icon';

/**
 * ErrorState Component
 * Standardized error display component with consistent styling
 * iOS 26 style with proper spacing and visual hierarchy
 */
export default function ErrorState({
  title = 'Error',
  message,
  action,
  actionLabel,
  onAction,
  className,
  variant = 'default',
}) {
  return (
    <GlassCard 
      variant={variant} 
      className={clsx('p-6 border border-red-200 bg-red-50/50', className)}
    >
      <div className="flex items-start gap-3">
        <Icon 
          name="error" 
          size="md" 
          variant="default" 
          className="text-red-500 flex-shrink-0" 
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 text-red-500">{title}</h3>
          <p className="text-sm text-neutral-text-secondary mb-4">
            {message || 'An error occurred. Please try again.'}
          </p>
          {(action || actionLabel || onAction) && (
            <div className="flex gap-2">
              {action || (
                <GlassButton 
                  variant="primary" 
                  size="md" 
                  onClick={onAction}
                >
                  {actionLabel || 'Try Again'}
                </GlassButton>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

