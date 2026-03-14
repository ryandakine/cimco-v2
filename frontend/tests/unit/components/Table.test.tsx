import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '@/components/Table'

describe('Table Components', () => {
  describe('Table', () => {
    it('renders children correctly', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </Table>
      )
      expect(screen.getByText('Cell')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Table className="custom-table" data-testid="table" />)
      expect(screen.getByTestId('table')).toHaveClass('custom-table')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLTableElement | null }
      render(<Table ref={ref} data-testid="table" />)
      expect(ref.current).toBeInstanceOf(HTMLTableElement)
    })

    it('has correct displayName', () => {
      expect(Table.displayName).toBe('Table')
    })
  })

  describe('TableHead', () => {
    it('renders children correctly', () => {
      render(
        <Table>
          <TableHead>
            <tr>
              <th>Header</th>
            </tr>
          </TableHead>
        </Table>
      )
      expect(screen.getByText('Header')).toBeInTheDocument()
    })

    it('applies bg-slate-800 class', () => {
      render(
        <Table>
          <TableHead data-testid="thead">
            <tr></tr>
          </TableHead>
        </Table>
      )
      expect(screen.getByTestId('thead')).toHaveClass('bg-slate-800')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLTableSectionElement | null }
      render(
        <Table>
          <TableHead ref={ref} />
        </Table>
      )
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    })

    it('has correct displayName', () => {
      expect(TableHead.displayName).toBe('TableHead')
    })
  })

  describe('TableBody', () => {
    it('renders children correctly', () => {
      render(
        <Table>
          <TableBody>
            <tr>
              <td>Body Cell</td>
            </tr>
          </TableBody>
        </Table>
      )
      expect(screen.getByText('Body Cell')).toBeInTheDocument()
    })

    it('applies divide-y class', () => {
      render(
        <Table>
          <TableBody data-testid="tbody">
            <tr></tr>
          </TableBody>
        </Table>
      )
      expect(screen.getByTestId('tbody')).toHaveClass('divide-y')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLTableSectionElement | null }
      render(
        <Table>
          <TableBody ref={ref} />
        </Table>
      )
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    })

    it('has correct displayName', () => {
      expect(TableBody.displayName).toBe('TableBody')
    })
  })

  describe('TableRow', () => {
    it('renders children correctly', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <td>Row Cell</td>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByText('Row Cell')).toBeInTheDocument()
    })

    it('applies hover styles when not selected', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <td>Cell</td>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByTestId('row')).toHaveClass('hover:bg-slate-800/50')
    })

    it('applies selected styles when isSelected is true', () => {
      render(
        <Table>
          <TableBody>
            <TableRow isSelected data-testid="row">
              <td>Cell</td>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByTestId('row')).toHaveClass('bg-cyan-500/10')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLTableRowElement | null }
      render(
        <Table>
          <TableBody>
            <TableRow ref={ref} />
          </TableBody>
        </Table>
      )
      expect(ref.current).toBeInstanceOf(HTMLTableRowElement)
    })

    it('has correct displayName', () => {
      expect(TableRow.displayName).toBe('TableRow')
    })
  })

  describe('TableHeader', () => {
    it('renders children correctly', () => {
      render(
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Header Cell</TableHeader>
            </tr>
          </TableHead>
        </Table>
      )
      expect(screen.getByText('Header Cell')).toBeInTheDocument()
    })

    it('applies header styles', () => {
      render(
        <Table>
          <TableHead>
            <tr>
              <TableHeader data-testid="th">Header</TableHeader>
            </tr>
          </TableHead>
        </Table>
      )
      expect(screen.getByTestId('th')).toHaveClass('font-semibold')
      expect(screen.getByTestId('th')).toHaveClass('text-slate-300')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLTableCellElement | null }
      render(
        <Table>
          <TableHead>
            <tr>
              <TableHeader ref={ref} />
            </tr>
          </TableHead>
        </Table>
      )
      expect(ref.current).toBeInstanceOf(HTMLTableCellElement)
    })

    it('has correct displayName', () => {
      expect(TableHeader.displayName).toBe('TableHeader')
    })
  })

  describe('TableCell', () => {
    it('renders children correctly', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Data Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByText('Data Cell')).toBeInTheDocument()
    })

    it('applies cell styles', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByTestId('td')).toHaveClass('px-4')
      expect(screen.getByTestId('td')).toHaveClass('py-3')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLTableCellElement | null }
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell ref={ref} />
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(ref.current).toBeInstanceOf(HTMLTableCellElement)
    })

    it('has correct displayName', () => {
      expect(TableCell.displayName).toBe('TableCell')
    })
  })
})
