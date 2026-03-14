import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from '@/components/Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Card data-testid="card">Default</Card>)
    expect(screen.getByTestId('card')).toHaveClass('shadow-lg')
  })

  it('applies outlined variant styles', () => {
    render(<Card variant="outlined" data-testid="card">Outlined</Card>)
    expect(screen.getByTestId('card')).toHaveClass('border')
    expect(screen.getByTestId('card')).toHaveClass('border-slate-700')
  })

  it('applies padding none', () => {
    render(<Card padding="none" data-testid="card">No Padding</Card>)
    expect(screen.getByTestId('card')).not.toHaveClass('p-3')
    expect(screen.getByTestId('card')).not.toHaveClass('p-4')
    expect(screen.getByTestId('card')).not.toHaveClass('p-6')
  })

  it('applies padding sm', () => {
    render(<Card padding="sm" data-testid="card">Small Padding</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-3')
  })

  it('applies padding md', () => {
    render(<Card padding="md" data-testid="card">Medium Padding</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-4')
  })

  it('applies padding lg', () => {
    render(<Card padding="lg" data-testid="card">Large Padding</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-6')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card">Custom</Card>)
    expect(screen.getByTestId('card')).toHaveClass('custom-class')
  })

  it('applies base styles', () => {
    render(<Card data-testid="card">Card</Card>)
    expect(screen.getByTestId('card')).toHaveClass('bg-slate-800')
    expect(screen.getByTestId('card')).toHaveClass('rounded-lg')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Card ref={ref} data-testid="card">Ref Card</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has correct displayName', () => {
    expect(Card.displayName).toBe('Card')
  })

  it('passes through additional props', () => {
    render(<Card data-testid="card" id="my-card">Card with ID</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('id', 'my-card')
  })
})
