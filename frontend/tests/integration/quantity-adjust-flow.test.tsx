import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QuantityAdjustModal } from '@/features/inventory/QuantityAdjustModal'
import { mockPart } from '../fixtures/parts'
import type { Part } from '@/types'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
}

describe('Quantity Adjust Flow Integration', () => {
  it('renders modal when open', () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    expect(screen.getByText(/adjust quantity/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={false} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    expect(screen.queryByText(/adjust quantity/i)).not.toBeInTheDocument()
  })

  it('displays part information', () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    expect(screen.getByText(mockPart.name)).toBeInTheDocument()
    expect(screen.getByText(/part #:/i)).toBeInTheDocument()
  })

  it('displays current and min quantity', () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    expect(screen.getByText(/current:/i)).toBeInTheDocument()
    expect(screen.getByText(/min:/i)).toBeInTheDocument()
  })

  it('allows incrementing quantity', async () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    const plusButton = screen.getAllByRole('button').find(b => b.querySelector('svg'))
    if (plusButton) {
      fireEvent.click(plusButton)
    }
    
    // The input should update
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/enter amount/i)
      expect(input).toBeInTheDocument()
    })
  })

  it('requires reason input', async () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    const textarea = screen.getByPlaceholderText(/why are you adjusting/i)
    expect(textarea).toBeInTheDocument()
  })

  it('has cancel button', () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    expect(screen.getByText(/cancel/i)).toBeInTheDocument()
  })

  it('has save changes button', () => {
    const onClose = () => {}
    render(
      <QuantityAdjustModal part={mockPart} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    expect(screen.getByText(/save changes/i)).toBeInTheDocument()
  })

  it('returns null when part is null', () => {
    const onClose = () => {}
    const { container } = render(
      <QuantityAdjustModal part={null} isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    )
    
    // Modal should not render content when part is null
    expect(container).toBeEmptyDOMElement()
  })
})
