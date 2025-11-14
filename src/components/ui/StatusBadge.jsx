import { clsx } from 'clsx';
import GlassBadge from './GlassBadge';

/**
 * Status Badge Component
 * Displays status with appropriate color coding
 */
export default function StatusBadge({ status, className }) {
  const statusConfig = {
    // Campaign statuses
    draft: { label: 'Draft', variant: 'default', color: 'border-subtle' },
    scheduled: { label: 'Scheduled', variant: 'ice', color: 'ice-accent' },
    active: { label: 'Active', variant: 'ice', color: 'ice-accent' },
    completed: { label: 'Completed', variant: 'default', color: 'border-subtle' },
    cancelled: { label: 'Cancelled', variant: 'default', color: 'red-400' },
    
    // Contact consent statuses
    opted_in: { label: 'Opted In', variant: 'ice', color: 'ice-accent' },
    opted_out: { label: 'Opted Out', variant: 'default', color: 'red-400' },
    pending: { label: 'Pending', variant: 'default', color: 'border-subtle' },
    
    // Automation statuses
    paused: { label: 'Paused', variant: 'default', color: 'border-subtle' },
    
    // Message statuses
    sent: { label: 'Sent', variant: 'ice', color: 'ice-accent' },
    delivered: { label: 'Delivered', variant: 'ice', color: 'ice-accent' },
    failed: { label: 'Failed', variant: 'default', color: 'red-400' },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    label: status || 'Unknown',
    variant: 'default',
    color: 'border-subtle',
  };

  return (
    <GlassBadge
      variant={config.variant}
      className={clsx(
        config.color === 'red-400' && 'text-red-400 border-red-400/30',
        className
      )}
    >
      {config.label}
    </GlassBadge>
  );
}

