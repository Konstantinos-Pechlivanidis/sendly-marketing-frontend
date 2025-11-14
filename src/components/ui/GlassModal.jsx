import { useEffect } from 'react';
import { clsx } from 'clsx';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import Icon from './Icon';

/**
 * Glass Modal Component
 * Modal with glassmorphism styling
 */
export default function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap: focus the modal when it opens
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-text-primary/20 backdrop-blur-sm" />
      
      {/* Modal */}
      <GlassCard
        ref={modalRef}
        variant="ice"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={clsx(
          'relative z-10 w-full',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-border/60">
            {title && (
              <h2 id="modal-title" className="text-2xl font-bold text-neutral-text-primary">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors focus-ring"
                aria-label="Close modal"
              >
                <Icon name="arrowRight" size="md" className="rotate-45" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div>{children}</div>
      </GlassCard>
    </div>
  );
}

