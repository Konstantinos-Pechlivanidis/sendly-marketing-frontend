import { clsx } from 'clsx';

export default function GlassBadge({ 
  children, 
  variant = 'default',
  className,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
  
  const variantClasses = {
    default: 'bg-ice-soft text-ice-primary',
    fuchsia: 'bg-fuchsia-soft text-fuchsia-primary',
    ice: 'bg-ice-soft text-ice-primary',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

