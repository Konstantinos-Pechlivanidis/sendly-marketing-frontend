import { clsx } from 'clsx';

export default function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  as,
  ...props
}) {
  const baseClasses = 'transition-button focus-ring font-medium rounded-lg inline-flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-ice-primary text-white hover:bg-ice-deep shadow-glow-ice-light hover:shadow-glow-ice-light-lg',
    ghost: 'border border-neutral-border text-neutral-text-primary hover:border-ice-primary hover:text-ice-primary bg-transparent',
    fuchsia: 'bg-fuchsia-primary text-white hover:bg-fuchsia-primary/90 shadow-glow-fuchsia-light',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'active:scale-95';

  // Handle 'as' prop for Link components
  const Component = as || 'button';
  const buttonProps = Component === 'button' ? { type: 'button', disabled } : {};
  
  return (
    <Component
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
      {...buttonProps}
      {...props}
    >
      {children}
    </Component>
  );
}

