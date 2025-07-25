import { screen, waitFor } from '@testing-library/react'
import { getOptionalString } from '@zodiac/form-data'
import { useEffect, useRef } from 'react'
import { useNavigation } from 'react-router'
import { sleepTillIdle } from './sleepTillIdle'

const watchActionStateElementId = 'test-action-state'

export const WatchForActions = () => {
  const { state, formData } = useNavigation()

  const intentRef = useRef<string | undefined>('')

  useEffect(() => {
    if (formData == null) {
      return
    }

    intentRef.current = getOptionalString(formData, 'intent')
  }, [formData])

  return (
    <div
      data-testid={watchActionStateElementId}
      data-state={state}
      data-intent={intentRef.current}
    />
  )
}

export const waitForPendingActions = async (intent?: string) => {
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
        expect(intent).toEqual(testElement.getAttribute('data-intent'))
      }
    })
  })
}
