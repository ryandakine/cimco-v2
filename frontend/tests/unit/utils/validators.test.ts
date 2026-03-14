import { describe, it, expect } from 'vitest'
import {
  validateLoginCredentials,
  validatePart,
  validateQuantityAdjustment,
  isValidEmail,
  isPositiveNumber,
  isNonEmptyString,
} from '@/utils/validators'
import type { LoginCredentials, Part, QuantityAdjustment } from '@/types'

describe('validators', () => {
  describe('validateLoginCredentials', () => {
    it('returns empty array for valid credentials', () => {
      const creds: LoginCredentials = { username: 'admin', password: 'secret' }
      expect(validateLoginCredentials(creds)).toEqual([])
    })

    it('returns error for empty username', () => {
      const creds: LoginCredentials = { username: '', password: 'secret' }
      const errors = validateLoginCredentials(creds)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toEqual({ field: 'username', message: 'Username is required' })
    })

    it('returns error for whitespace-only username', () => {
      const creds: LoginCredentials = { username: '   ', password: 'secret' }
      const errors = validateLoginCredentials(creds)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('username')
    })

    it('returns error for empty password', () => {
      const creds: LoginCredentials = { username: 'admin', password: '' }
      const errors = validateLoginCredentials(creds)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toEqual({ field: 'password', message: 'Password is required' })
    })

    it('returns errors for both empty fields', () => {
      const creds: LoginCredentials = { username: '', password: '' }
      const errors = validateLoginCredentials(creds)
      expect(errors).toHaveLength(2)
    })

    it('handles undefined fields', () => {
      const creds = { username: undefined, password: undefined } as unknown as LoginCredentials
      const errors = validateLoginCredentials(creds)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('validatePart', () => {
    const validPart: Partial<Part> = {
      name: 'Test Part',
      category: 'Test Category',
      quantity: 10,
      min_quantity: 5,
      lead_time_days: 7,
    }

    it('returns empty array for valid part', () => {
      expect(validatePart(validPart)).toEqual([])
    })

    it('returns error for empty name', () => {
      const part = { ...validPart, name: '' }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'name', message: 'Name is required' })
    })

    it('returns error for whitespace-only name', () => {
      const part = { ...validPart, name: '   ' }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'name', message: 'Name is required' })
    })

    it('returns error for empty category', () => {
      const part = { ...validPart, category: '' }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'category', message: 'Category is required' })
    })

    it('returns error for negative quantity', () => {
      const part = { ...validPart, quantity: -1 }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'quantity', message: 'Quantity must be 0 or greater' })
    })

    it('returns error for undefined quantity', () => {
      const part = { ...validPart, quantity: undefined }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'quantity', message: 'Quantity must be 0 or greater' })
    })

    it('returns error for negative min_quantity', () => {
      const part = { ...validPart, min_quantity: -1 }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'min_quantity', message: 'Min quantity must be 0 or greater' })
    })

    it('returns error for negative lead_time_days', () => {
      const part = { ...validPart, lead_time_days: -1 }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'lead_time_days', message: 'Lead time must be 0 or greater' })
    })

    it('returns error for negative unit_cost', () => {
      const part = { ...validPart, unit_cost: -10 }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'unit_cost', message: 'Unit cost must be 0 or greater' })
    })

    it('accepts zero unit_cost', () => {
      const part = { ...validPart, unit_cost: 0 }
      expect(validatePart(part)).toEqual([])
    })

    it('returns error for wear_rating below 0', () => {
      const part = { ...validPart, wear_rating: -1 }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'wear_rating', message: 'Wear rating must be between 0 and 10' })
    })

    it('returns error for wear_rating above 10', () => {
      const part = { ...validPart, wear_rating: 11 }
      const errors = validatePart(part)
      expect(errors).toContainEqual({ field: 'wear_rating', message: 'Wear rating must be between 0 and 10' })
    })

    it('accepts wear_rating at boundaries', () => {
      expect(validatePart({ ...validPart, wear_rating: 0 })).toEqual([])
      expect(validatePart({ ...validPart, wear_rating: 10 })).toEqual([])
    })

    it('accepts undefined optional fields', () => {
      const part = {
        name: validPart.name,
        category: validPart.category,
        quantity: validPart.quantity,
        min_quantity: validPart.min_quantity,
        lead_time_days: validPart.lead_time_days,
      }
      expect(validatePart(part)).toEqual([])
    })
  })

  describe('validateQuantityAdjustment', () => {
    it('returns empty array for valid adjustment', () => {
      const adjustment: QuantityAdjustment = {
        part_id: 1,
        change_amount: 5,
        reason: 'Restocked',
      }
      expect(validateQuantityAdjustment(adjustment)).toEqual([])
    })

    it('returns error for zero change_amount', () => {
      const adjustment: QuantityAdjustment = {
        part_id: 1,
        change_amount: 0,
        reason: 'No change',
      }
      const errors = validateQuantityAdjustment(adjustment)
      expect(errors).toContainEqual({ field: 'change_amount', message: 'Change amount cannot be zero' })
    })

    it('returns error for empty reason', () => {
      const adjustment: QuantityAdjustment = {
        part_id: 1,
        change_amount: 5,
        reason: '',
      }
      const errors = validateQuantityAdjustment(adjustment)
      expect(errors).toContainEqual({ field: 'reason', message: 'Reason is required' })
    })

    it('returns error for whitespace-only reason', () => {
      const adjustment: QuantityAdjustment = {
        part_id: 1,
        change_amount: 5,
        reason: '   ',
      }
      const errors = validateQuantityAdjustment(adjustment)
      expect(errors).toContainEqual({ field: 'reason', message: 'Reason is required' })
    })

    it('returns error for short reason', () => {
      const adjustment: QuantityAdjustment = {
        part_id: 1,
        change_amount: 5,
        reason: 'ab',
      }
      const errors = validateQuantityAdjustment(adjustment)
      expect(errors).toContainEqual({ field: 'reason', message: 'Reason must be at least 3 characters' })
    })

    it('accepts reason with exactly 3 characters', () => {
      const adjustment: QuantityAdjustment = {
        part_id: 1,
        change_amount: 5,
        reason: 'abc',
      }
      expect(validateQuantityAdjustment(adjustment)).toEqual([])
    })

    it('accepts negative change_amount', () => {
      const adjustment: QuantityAdjustment = {
        part_id: 1,
        change_amount: -5,
        reason: 'Used for repair',
      }
      expect(validateQuantityAdjustment(adjustment)).toEqual([])
    })
  })

  describe('isValidEmail', () => {
    it('returns true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('returns false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test@.com')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isPositiveNumber', () => {
    it('returns true for positive numbers', () => {
      expect(isPositiveNumber(5)).toBe(true)
      expect(isPositiveNumber(0)).toBe(true)
      expect(isPositiveNumber(0.5)).toBe(true)
    })

    it('returns false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false)
    })

    it('returns false for NaN', () => {
      expect(isPositiveNumber(NaN)).toBe(false)
    })

    it('returns false for non-numbers', () => {
      expect(isPositiveNumber('5')).toBe(false)
      expect(isPositiveNumber(null)).toBe(false)
      expect(isPositiveNumber(undefined)).toBe(false)
    })
  })

  describe('isNonEmptyString', () => {
    it('returns true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString('a')).toBe(true)
    })

    it('returns false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false)
    })

    it('returns false for whitespace-only string', () => {
      expect(isNonEmptyString('   ')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(isNonEmptyString(123)).toBe(false)
      expect(isNonEmptyString(null)).toBe(false)
      expect(isNonEmptyString(undefined)).toBe(false)
    })
  })
})
