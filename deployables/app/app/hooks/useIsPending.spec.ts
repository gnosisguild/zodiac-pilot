import { renderHook } from '@testing-library/react'
import { formData } from '@zodiac/form-data'
import { useNavigation } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { useIsPending } from './useIsPending'

vi.mock('react-router', async (importOriginal) => {
  const module = await importOriginal<typeof import('react-router')>()

  return {
    ...module,

    useNavigation: vi.fn(),
  }
})

const mockUseNavigation = vi.mocked(useNavigation)

describe('useIsPending', () => {
  it('returns "false" when the page is idle', () => {
    mockUseNavigation.mockReturnValue(mockNavigation({ state: 'idle' }))

    const { result } = renderHook(() => useIsPending())

    expect(result.current).toEqual(false)
  })

  it('returns "true" when the page is loading', () => {
    mockUseNavigation.mockReturnValue(mockNavigation({ state: 'loading' }))

    const { result } = renderHook(() => useIsPending())

    expect(result.current).toEqual(true)
  })

  describe('Intent', () => {
    it('return "false" when the current intent does not match the expected one', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData({ intent: 'expected' }),
        }),
      )

      const { result } = renderHook(() => useIsPending('received'))

      expect(result.current).toEqual(false)
    })

    it('return "true" when the current intent matches the expected one', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData({ intent: 'expected' }),
        }),
      )

      const { result } = renderHook(() => useIsPending('expected'))

      expect(result.current).toEqual(true)
    })

    it('uses "OR" logic when multiple intents are passed', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData({ intent: 'option-2' }),
        }),
      )

      const { result } = renderHook(() =>
        useIsPending(['option-1', 'option-2']),
      )

      expect(result.current).toEqual(true)
    })
  })

  describe('Check function', () => {
    it('returns "false" when the check function returns "false"', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData(),
        }),
      )

      const { result } = renderHook(() => useIsPending(undefined, () => false))

      expect(result.current).toEqual(false)
    })

    it('returns "true" when the check function returns "true"', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData(),
        }),
      )

      const { result } = renderHook(() => useIsPending(undefined, () => true))

      expect(result.current).toEqual(true)
    })

    it('calls the check function with the form data', () => {
      const data = formData()

      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: data,
        }),
      )

      const checkFn = vi.fn()

      renderHook(() => useIsPending(undefined, checkFn))

      expect(checkFn).toHaveBeenCalledWith(data)
    })
  })

  describe('Intent and Check function', () => {
    it('return "false" if the intent matches but the check function returns "false"', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData({ intent: 'expected' }),
        }),
      )

      const { result } = renderHook(() => useIsPending('expected', () => false))

      expect(result.current).toEqual(false)
    })

    it('return "false" if the check functions returns "true" but the intent does not match', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData({ intent: 'expected' }),
        }),
      )

      const { result } = renderHook(() => useIsPending('received', () => true))

      expect(result.current).toEqual(false)
    })

    it('returns "true" when both the intent and the check function match', () => {
      mockUseNavigation.mockReturnValue(
        mockNavigation({
          state: 'loading',
          formData: formData({ intent: 'expected' }),
        }),
      )

      const { result } = renderHook(() => useIsPending('expected', () => true))

      expect(result.current).toEqual(true)
    })
  })
})

const mockNavigation = (
  options: Partial<ReturnType<typeof useNavigation>>,
): ReturnType<typeof useNavigation> => {
  switch (options.state) {
    case 'idle':
      return {
        state: 'idle',
        formAction: undefined,
        formData: undefined,
        formEncType: undefined,
        formMethod: undefined,
        json: undefined,
        location: undefined,
        text: undefined,

        ...options,
      }
    case 'loading':
      return {
        state: 'loading',
        formAction: undefined,
        formData: undefined,
        formEncType: undefined,
        formMethod: 'POST',
        json: undefined,
        location: {
          hash: '',
          key: '',
          pathname: '',
          search: '',
          state: {},
        },
        text: undefined,

        ...options,
      }
    case 'submitting':
      return {
        state: 'submitting',
        formAction: '/',
        formData: undefined,
        formEncType: 'application/json',
        formMethod: 'POST',
        json: undefined,
        location: {
          hash: '',
          key: '',
          pathname: '',
          search: '',
          state: {},
        },
        text: undefined,

        ...options,
      }

    default: {
      throw new Error(`Unknown navigation state "${options.state}"`)
    }
  }
}
