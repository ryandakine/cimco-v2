import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Input } from '@/components/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" name="username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('renders without label', () => {
    render(<Input name="test" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input name="test" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays error message', () => {
    render(<Input name="test" error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('displays helper text when no error', () => {
    render(<Input name="test" helperText="Enter your name" />)
    expect(screen.getByText('Enter your name')).toBeInTheDocument()
  })

  it('does not display helper text when error is present', () => {
    render(<Input name="test" error="Error" helperText="Helper" />)
    expect(screen.queryByText('Helper')).not.toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input name="test" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('shows required indicator', () => {
    render(<Input label="Name" name="name" required />)
    const label = screen.getByText('Name')
    expect(label.nextSibling).toHaveTextContent('*')
  })

  it('applies error styling', () => {
    render(<Input name="test" error="Error" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('applies custom className', () => {
    render(<Input name="test" className="custom-class" />)
    expect(screen.getByRole('textbox').parentElement).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} name="test" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('has correct displayName', () => {
    expect(Input.displayName).toBe('Input')
  })

  it('renders with placeholder', () => {
    render(<Input name="test" placeholder="Enter value" />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('renders with type attribute', () => {
    render(<Input name="password" type="password" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password')
  })

  it('renders with default type text', () => {
    render(<Input name="test" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })
})
