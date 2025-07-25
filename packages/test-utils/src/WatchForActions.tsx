import { screen, waitFor } from '@testing-library/react'
import { getOptionalString } from '@zodiac/form-data'
import { useEffect, useRef } from 'react'
import { FormMethod, useNavigation } from 'react-router'
import { sleepTillIdle } from './sleepTillIdle'

const watchActionStateElementId = 'test-action-state'

export const WatchForActions = () => {
  const { state, formData, formMethod } = useNavigation()

  const intentRef = useRef<string | undefined>('')

  useEffect(() => {
    if (formData == null) {
      return
    }

    intentRef.current = getOptionalString(formData, 'intent')
  }, [formData])

  const formMethodRef = useRef<FormMethod | null>(null)

  useEffect(() => {
    if (formMethod == null) {
      return
    }

    formMethodRef.current = formMethod
  }, [formMethod])

  return (
    <div
      data-testid={watchActionStateElementId}
      data-state={state}
      data-intent={intentRef.current}
      data-method={formMethodRef.current}
    />
  )
}

type WaitForNavigationOptions = {
  intent?: string
  method?: FormMethod
}

const waitForNavigation = async ({
  intent,
  method,
}: WaitForNavigationOptions = {}) => {
  await sleepTillIdle()

  return waitFor(async () => {
    // Importing this dynamically, because otherwise vitest
    // pollutes the global space and might conflight with playwright
    const { expect } = await import('vitest')

    return waitFor(() => {
      const testElement = screen.getByTestId(watchActionStateElementId)
      const state = testElement.getAttribute('data-state')

      expect(state).toEqual('idle')

      if (intent != null) {
        expect(testElement.getAttribute('data-intent')).toEqual(intent)
      }

      if (method != null) {
        expect(testElement.getAttribute('data-method')).toEqual(method)
      }
    })
  })
}

export const waitForPendingActions = async (intent?: string) =>
  waitForNavigation({ intent })

export const waitForPendingLoaders = async () =>
  waitForNavigation({ method: 'GET' })
