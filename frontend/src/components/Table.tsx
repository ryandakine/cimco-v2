import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => (
    <table
      ref={ref}
      className={clsx('w-full text-left border-collapse', className)}
      {...props}
    >
      {children}
    </table>
  )
);
Table.displayName = 'Table';

export const TableHead = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead ref={ref} className={clsx('bg-slate-800', className)} {...props}>
      {children}
    </thead>
  )
);
TableHead.displayName = 'TableHead';

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody ref={ref} className={clsx('divide-y divide-slate-700', className)} {...props}>
      {children}
    </tbody>
  )
);
TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, isSelected, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        'transition-colors',
        isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
);
TableRow.displayName = 'TableRow';

export const TableHeader = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx(
        'px-4 py-3 text-sm font-semibold text-slate-300 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
);
TableHeader.displayName = 'TableHeader';

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx('px-4 py-3 text-sm', className)}
      {...props}
    >
      {children}
    </td>
  )
);
TableCell.displayName = 'TableCell';
