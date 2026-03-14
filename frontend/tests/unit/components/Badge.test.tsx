import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '@/components/Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies default variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-slate-700/50')
  })

  it('applies primary variant', () => {
    render(<Badge variant="primary">Primary</Badge>)
    expect(screen.getByText('Primary')).toHaveClass('bg-cyan-400/10')
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-emerald-400/10')
  })

  it('applies warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('bg-amber-400/10')
  })

  it('applies danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>)
    expect(screen.getByText('Danger')).toHaveClass('bg-red-400/10')
  })

  it('applies info variant', () => {
    render(<Badge variant="info">Info</Badge>)
    expect(screen.getByText('Info')).toHaveClass('bg-blue-400/10')
  })

  it('applies sm size', () => {
    render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toHaveClass('text-xs')
  })

  it('applies md size', () => {
    render(<Badge size="md">Medium</Badge>)
    expect(screen.getByText('Medium')).toHaveClass('text-sm')
  })

  it('applies lg size', () => {
    render(<Badge size="lg">Large</Badge>)
    expect(screen.getByText('Large')).toHaveClass('px-3')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('custom-class')
  })

  it('renders with complex children', () => {
    render(
      <Badge>
        <span data-testid="icon">★</span>
        <span>With Icon</span>
      </Badge>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })
})
