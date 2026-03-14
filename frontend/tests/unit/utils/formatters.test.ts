import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  getStockState,
  getStockStateLabel,
  getStockStateColor,
  getQuantityColor,
  truncateText,
  toCSV,
  downloadCSV,
} from '@/utils/formatters'
import type { Part } from '@/types'

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats ISO date string correctly', () => {
      expect(formatDate('2024-03-13T12:00:00Z')).toBe('Mar 13, 2024')
    })

    it('formats Date object correctly', () => {
      expect(formatDate(new Date('2024-03-13T12:00:00Z'))).toBe('Mar 13, 2024')
    })

    it('handles different date formats', () => {
      expect(formatDate('2024-01-01')).toBe('Jan 1, 2024')
      expect(formatDate('2023-12-25T00:00:00')).toBe('Dec 25, 2023')
    })
  })

  describe('formatDateTime', () => {
    it('formats ISO date string with time', () => {
      const result = formatDateTime('2024-03-13T14:30:00Z')
      expect(result).toContain('Mar')
      expect(result).toContain('13')
      expect(result).toContain('2024')
    })

    it('formats Date object with time', () => {
      const result = formatDateTime(new Date('2024-03-13T14:30:00Z'))
      expect(result).toContain('Mar')
      expect(result).toContain('2024')
    })
  })

  describe('formatRelativeTime', () => {
    it('returns relative time for past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const result = formatRelativeTime(yesterday)
      expect(result).toContain('ago')
    })

    it('handles ISO string input', () => {
      const result = formatRelativeTime('2024-01-01T00:00:00Z')
      expect(result).toContain('ago')
    })
  })

  describe('formatCurrency', () => {
    it('formats number as USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats integer as currency', () => {
      expect(formatCurrency(100)).toBe('$100.00')
    })

    it('returns dash for undefined', () => {
      expect(formatCurrency(undefined)).toBe('-')
    })

    it('returns dash for null', () => {
      expect(formatCurrency(null as unknown as undefined)).toBe('-')
    })

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles negative numbers', () => {
      expect(formatCurrency(-50)).toBe('-$50.00')
    })
  })

  describe('formatNumber', () => {
    it('formats with thousands separator', () => {
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('formats small numbers without separator', () => {
      expect(formatNumber(100)).toBe('100')
    })

    it('returns dash for undefined', () => {
      expect(formatNumber(undefined)).toBe('-')
    })

    it('returns dash for null', () => {
      expect(formatNumber(null as unknown as undefined)).toBe('-')
    })

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('getStockState', () => {
    it('returns out_of_stock when quantity is 0', () => {
      const part: Part = { quantity: 0, min_quantity: 5 } as Part
      expect(getStockState(part)).toBe('out_of_stock')
    })

    it('returns low_stock when quantity <= min_quantity', () => {
      const part: Part = { quantity: 5, min_quantity: 5 } as Part
      expect(getStockState(part)).toBe('low_stock')
      
      const part2: Part = { quantity: 3, min_quantity: 5 } as Part
      expect(getStockState(part2)).toBe('low_stock')
    })

    it('returns in_stock when quantity > min_quantity', () => {
      const part: Part = { quantity: 10, min_quantity: 5 } as Part
      expect(getStockState(part)).toBe('in_stock')
    })
  })

  describe('getStockStateLabel', () => {
    it('returns correct label for in_stock', () => {
      expect(getStockStateLabel('in_stock')).toBe('In Stock')
    })

    it('returns correct label for low_stock', () => {
      expect(getStockStateLabel('low_stock')).toBe('Low Stock')
    })

    it('returns correct label for out_of_stock', () => {
      expect(getStockStateLabel('out_of_stock')).toBe('Out of Stock')
    })

    it('returns Unknown for invalid state', () => {
      expect(getStockStateLabel('invalid' as never)).toBe('Unknown')
    })
  })

  describe('getStockStateColor', () => {
    it('returns emerald colors for in_stock', () => {
      expect(getStockStateColor('in_stock')).toContain('emerald')
    })

    it('returns amber colors for low_stock', () => {
      expect(getStockStateColor('low_stock')).toContain('amber')
    })

    it('returns red colors for out_of_stock', () => {
      expect(getStockStateColor('out_of_stock')).toContain('red')
    })

    it('returns slate colors for invalid state', () => {
      expect(getStockStateColor('invalid' as never)).toContain('slate')
    })
  })

  describe('getQuantityColor', () => {
    it('returns red for zero quantity', () => {
      expect(getQuantityColor(0, 5)).toContain('red')
    })

    it('returns amber for low quantity', () => {
      expect(getQuantityColor(3, 5)).toContain('amber')
    })

    it('returns emerald for sufficient quantity', () => {
      expect(getQuantityColor(10, 5)).toContain('emerald')
    })
  })

  describe('truncateText', () => {
    it('returns original text if shorter than maxLength', () => {
      expect(truncateText('short', 10)).toBe('short')
    })

    it('truncates long text and adds ellipsis', () => {
      expect(truncateText('this is a very long text', 10)).toBe('this is a ...')
    })

    it('returns dash for undefined', () => {
      expect(truncateText(undefined, 10)).toBe('-')
    })

    it('returns dash for empty string', () => {
      expect(truncateText('', 10)).toBe('-')
    })
  })

  describe('toCSV', () => {
    it('converts simple data to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]
      const csv = toCSV(data)
      expect(csv).toContain('name,age')
      expect(csv).toContain('John,30')
      expect(csv).toContain('Jane,25')
    })

    it('handles custom headers', () => {
      const data = [{ name: 'John', age: 30 }]
      const csv = toCSV(data, { name: 'Full Name', age: 'Age' })
      expect(csv).toContain('Full Name,Age')
    })

    it('returns empty string for empty array', () => {
      expect(toCSV([])).toBe('')
    })

    it('escapes values with commas', () => {
      const data = [{ name: 'Doe, John', age: 30 }]
      const csv = toCSV(data)
      expect(csv).toContain('"Doe, John"')
    })

    it('escapes values with quotes', () => {
      const data = [{ name: 'John "Johnny"', age: 30 }]
      const csv = toCSV(data)
      expect(csv).toContain('"John ""Johnny"""')
    })

    it('handles null and undefined values', () => {
      const data = [{ name: 'John', age: null, city: undefined }]
      const csv = toCSV(data)
      expect(csv).toContain('John,,'
      )
    })
  })

  describe('downloadCSV', () => {
    it('creates and clicks download link', () => {
      const createElementSpy = vi.spyOn(document, 'createElement')
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')
      const clickSpy = vi.fn()
      
      createElementSpy.mockReturnValue({
        href: '',
        download: '',
        style: {},
        click: clickSpy,
      } as unknown as HTMLAnchorElement)

      downloadCSV('name,age\nJohn,30', 'test.csv')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })
})
