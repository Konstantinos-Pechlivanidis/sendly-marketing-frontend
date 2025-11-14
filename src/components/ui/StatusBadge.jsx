import { memo } from 'react';
import { clsx } from 'clsx';
import GlassBadge from './GlassBadge';

/**
 * Status Badge Component
 * Displays status with appropriate color coding
 */
const StatusBadge = memo(function StatusBadge({ status, className }) {
  const statusConfig = {
    // Campaign statuses
    draft: { label: 'Draft', variant: 'default', color: 'neutral-text-secondary' },
    scheduled: { label: 'Scheduled', variant: 'ice', color: 'ice-primary' },
    active: { label: 'Active', variant: 'ice', color: 'ice-primary' },
    completed: { label: 'Completed', variant: 'default', color: 'neutral-text-secondary' },
    cancelled: { label: 'Cancelled', variant: 'default', color: 'red-500' },
    
    // Contact consent statuses
    opted_in: { label: 'Opted In', variant: 'ice', color: 'ice-primary' },
    opted_out: { label: 'Opted Out', variant: 'default', color: 'red-500' },
    pending: { label: 'Pending', variant: 'default', color: 'neutral-text-secondary' },
    
    // Automation statuses
    paused: { label: 'Paused', variant: 'default', color: 'neutral-text-secondary' },
    
    // Message statuses
    sent: { label: 'Sent', variant: 'ice', color: 'ice-primary' },
    delivered: { label: 'Delivered', variant: 'ice', color: 'ice-primary' },
    failed: { label: 'Failed', variant: 'default', color: 'red-500' },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    label: status || 'Unknown',
    variant: 'default',
    color: 'neutral-text-secondary',
  };

  return (
    <GlassBadge
      variant={config.variant}
      className={clsx(
        config.color === 'red-500' && 'text-red-500 bg-red-50 border-red-200',
        className
      )}
    >
      {config.label}
    </GlassBadge>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;

