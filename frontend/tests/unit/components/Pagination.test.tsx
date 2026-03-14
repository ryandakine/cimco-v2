import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from '@/components/Pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    onPageChange: vi.fn(),
  }

  it('renders page numbers', () => {
    render(<Pagination {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)
    const prevButton = screen.getByText('Previous').closest('button')
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={10} />)
    const nextButton = screen.getByText('Next').closest('button')
    expect(nextButton).toBeDisabled()
  })

  it('calls onPageChange when page clicked', () => {
    const onChange = vi.fn()
    render(<Pagination {...defaultProps} onPageChange={onChange} />)
    fireEvent.click(screen.getByText('5'))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('calls onPageChange when previous clicked', () => {
    const onChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={5} onPageChange={onChange} />)
    fireEvent.click(screen.getByText('Previous').closest('button')!)
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('calls onPageChange when next clicked', () => {
    const onChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={5} onPageChange={onChange} />)
    fireEvent.click(screen.getByText('Next').closest('button')!)
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('shows current page with active style', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)
    const currentPageButton = screen.getByText('3')
    expect(currentPageButton).toHaveClass('bg-cyan-600')
  })

  it('renders ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={20} />)
    const ellipses = screen.getAllByText('...')
    expect(ellipses.length).toBeGreaterThan(0)
  })

  it('shows page info text', () => {
    render(<Pagination {...defaultProps} />)
    expect(screen.getByText(/Page/)).toBeInTheDocument()
    expect(screen.getByText(/of/)).toBeInTheDocument()
  })

  it('shows total items count', () => {
    render(<Pagination {...defaultProps} totalItems={100} />)
    expect(screen.getByText(/100 total items/)).toBeInTheDocument()
  })

  it('hides pagination when only one page', () => {
    render(<Pagination {...defaultProps} totalPages={1} totalItems={5} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText(/5 items/)).toBeInTheDocument()
  })

  it('shows simplified view for first few pages', () => {
    render(<Pagination {...defaultProps} currentPage={2} totalPages={10} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows simplified view for last few pages', () => {
    render(<Pagination {...defaultProps} currentPage={9} totalPages={10} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('handles page 0 gracefully', () => {
    render(<Pagination {...defaultProps} currentPage={0} totalPages={5} />)
    const prevButton = screen.getByText('Previous').closest('button')
    expect(prevButton).toBeDisabled()
  })

  it('renders all page numbers for 7 or fewer pages', () => {
    render(<Pagination {...defaultProps} totalPages={7} />)
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument()
    }
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })
})
