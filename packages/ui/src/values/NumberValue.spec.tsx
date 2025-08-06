import { invariant } from '@epic-web/invariant'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatEther, maxUint256, parseEther } from 'viem'
import { describe, expect, it } from 'vitest'
import { NumberValue } from './NumberValue'

describe('NumberValue', () => {
  it.skipIf(process.env.CI != null)(
    'should render large numbers with full precision',
    async () => {
      render(
        <NumberValue precision={2}>
          {formatEther(maxUint256) as `${number}`}
        </NumberValue>,
      )

      const with2Decimals =
        '115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457.58'

      // Click to open popover
      await userEvent.hover(await screen.findByText(with2Decimals))

      // Get full precision value from popover
      const popoverValue = screen.getByRole('tooltip').textContent
      invariant(popoverValue != null, 'Popover value is null')
      const parsedBack = parseEther(popoverValue.replace(/,/g, ''))
      expect(parsedBack).toBe(maxUint256)
    },
  )
})
