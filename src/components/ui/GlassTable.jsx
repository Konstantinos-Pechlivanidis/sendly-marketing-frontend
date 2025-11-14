import { clsx } from 'clsx';

/**
 * Glass Table Component
 * Table with glassmorphism styling
 */
export default function GlassTable({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto" role="region" aria-label="Data table" tabIndex={0}>
      <table
        className={clsx(
          'w-full border-collapse',
          className
        )}
        role="table"
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

/**
 * Table Header
 */
export function GlassTableHeader({ children, className, ...props }) {
  return (
    <thead className={clsx('border-b border-neutral-border', className)} {...props}>
      {children}
    </thead>
  );
}

/**
 * Table Body
 */
export function GlassTableBody({ children, className, ...props }) {
  return (
    <tbody className={clsx('divide-y divide-neutral-border/50', className)} {...props}>
      {children}
    </tbody>
  );
}

/**
 * Table Row
 */
export function GlassTableRow({ children, className, hover = true, ...props }) {
  return (
    <tr
      className={clsx(
        'transition-colors',
        hover && 'hover:bg-neutral-surface-secondary/50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

/**
 * Table Header Cell
 */
export function GlassTableHeaderCell({ children, className, ...props }) {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold text-neutral-text-secondary uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

/**
 * Table Cell
 */
export function GlassTableCell({ children, className, ...props }) {
  return (
    <td
      className={clsx(
        'px-4 py-3 text-sm text-neutral-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

