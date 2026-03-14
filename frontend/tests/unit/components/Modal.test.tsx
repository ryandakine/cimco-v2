import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Modal } from '@/components/Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    const overlay = screen.getByText('Modal content').closest('[role="dialog"]')?.parentElement?.firstChild
    if (overlay) {
      fireEvent.click(overlay as Element)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('does not call onClose when overlay clicked if closeOnOverlayClick is false', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />)
    const overlay = screen.getByText('Modal content').closest('[role="dialog"]')?.parentElement?.firstChild
    if (overlay) {
      fireEvent.click(overlay as Element)
      expect(onClose).not.toHaveBeenCalled()
    }
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />)
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
  })

  it('does not render header when title is not provided and showCloseButton is false', () => {
    render(<Modal {...defaultProps} title={undefined} showCloseButton={false} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('applies size styles correctly', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')

    rerender(<Modal {...defaultProps} size="md" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg')

    rerender(<Modal {...defaultProps} size="lg" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl')

    rerender(<Modal {...defaultProps} size="xl" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl')
  })

  it('has correct ARIA attributes', () => {
    render(<Modal {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('renders without title', () => {
    render(<Modal {...defaultProps} title={undefined} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('prevents body scroll when open', () => {
    render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { unmount } = render(<Modal {...defaultProps} />)
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
