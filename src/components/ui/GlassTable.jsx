import { clsx } from 'clsx';

/**
 * Glass Table Component
 * Table with glassmorphism styling
 */
export default function GlassTable({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          'w-full border-collapse',
          className
        )}
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
    <thead className={clsx('border-b border-glass-border', className)} {...props}>
      {children}
    </thead>
  );
}

/**
 * Table Body
 */
export function GlassTableBody({ children, className, ...props }) {
  return (
    <tbody className={clsx('divide-y divide-glass-border/50', className)} {...props}>
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
        hover && 'hover:bg-glass-white/50',
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
        'px-4 py-3 text-left text-xs font-semibold text-border-subtle uppercase tracking-wider',
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
        'px-4 py-3 text-sm text-primary-light',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

