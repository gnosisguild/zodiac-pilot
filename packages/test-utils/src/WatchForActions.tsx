import { screen, waitFor } from '@testing-library/react'
import { useNavigation } from 'react-router'
import { sleepTillIdle } from './sleepTillIdle'

const watchActionStateElementId = 'test-action-state'

export const WatchForActions = () => {
  const navigation = useNavigation()

  return (
    <div
      data-testid={watchActionStateElementId}
      data-state={navigation.state}
    />
  )
}

export const waitForPendingActions = async () => {
  await sleepTillIdle()

  return waitFor(async () => {
    // Importing this dynamically, because otherwise vitest
    // pollutes the global space and might conflight with playwright
    const { expect } = await import('vitest')

    return waitFor(() => {
      const testElement = screen.getByTestId(watchActionStateElementId)
      const state = testElement.getAttribute('data-state')

      expect(state).toEqual('idle')
    })
  })
}
