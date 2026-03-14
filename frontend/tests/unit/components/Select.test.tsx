import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Select } from '@/components/Select'

const mockOptions = [
  { value: '', label: 'Select an option' },
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="Test Label" options={mockOptions} />)
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('renders without label', () => {
    render(<Select options={mockOptions} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(<Select options={mockOptions} />)
    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Select options={mockOptions} onChange={handleChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } })
    expect(handleChange).toHaveBeenCalledWith('option2')
  })

  it('displays error message', () => {
    render(<Select options={mockOptions} error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('displays helper text when no error', () => {
    render(<Select options={mockOptions} helperText="Choose wisely" />)
    expect(screen.getByText('Choose wisely')).toBeInTheDocument()
  })

  it('does not display helper text when error is present', () => {
    render(<Select options={mockOptions} error="Error" helperText="Helper" />)
    expect(screen.queryByText('Helper')).not.toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Select options={mockOptions} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('shows required indicator', () => {
    render(<Select label="Name" options={mockOptions} required />)
    const label = screen.getByText('Name')
    expect(label.nextSibling).toHaveTextContent('*')
  })

  it('applies error styling', () => {
    render(<Select options={mockOptions} error="Error" />)
    expect(screen.getByRole('combobox')).toHaveClass('border-red-500')
  })

  it('applies custom className', () => {
    render(<Select options={mockOptions} className="custom-class" />)
    expect(screen.getByRole('combobox').parentElement?.parentElement).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLSelectElement | null }
    render(<Select ref={ref} options={mockOptions} />)
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  it('has correct displayName', () => {
    expect(Select.displayName).toBe('Select')
  })

  it('applies size styles correctly', () => {
    const { rerender } = render(<Select options={mockOptions} size="sm" />)
    expect(screen.getByRole('combobox')).toHaveClass('min-h-[36px]')

    rerender(<Select options={mockOptions} size="md" />)
    expect(screen.getByRole('combobox')).toHaveClass('min-h-[40px]')

    rerender(<Select options={mockOptions} size="lg" />)
    expect(screen.getByRole('combobox')).toHaveClass('min-h-[48px]')
  })

  it('renders ChevronDown icon', () => {
    render(<Select options={mockOptions} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('calls original onChange if provided', () => {
    const handleChange = vi.fn()
    const handleCustomChange = vi.fn()
    render(<Select options={mockOptions} onChange={handleCustomChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'option1' } })
    expect(handleCustomChange).toHaveBeenCalledWith('option1')
  })
})
