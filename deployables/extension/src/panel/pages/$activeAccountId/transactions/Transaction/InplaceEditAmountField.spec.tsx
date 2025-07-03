import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InplaceEditAmountField } from './InplaceEditAmountField'

describe('InplaceEditAmountField', () => {
  const defaultProps = {
    value: '100' as const,
    label: 'Amount',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders in read-only mode initially', () => {
    render(<InplaceEditAmountField {...defaultProps} />)

    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveValue(100)
  })

  it('switches to edit mode when Edit amount button is clicked', async () => {
    const user = userEvent.setup()
    render(<InplaceEditAmountField {...defaultProps} />)

    const editButton = screen.getByRole('button', { name: /edit amount/i })
    await user.click(editButton)

    const input = screen.getByRole('spinbutton')
    await waitFor(() => {
      expect(input).not.toHaveAttribute('readonly')
    })
    expect(input).toHaveFocus()
  })

  it('confirms changes when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<InplaceEditAmountField {...defaultProps} />)

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit amount/i })
    await user.click(editButton)

    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '200')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '200' },
        }),
      )
    })
    expect(input).toHaveAttribute('readonly')
  })

  it('cancels changes when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<InplaceEditAmountField {...defaultProps} />)

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit amount/i })
    await user.click(editButton)

    const input = screen.getByRole('spinbutton')
    await user.type(input, '200')
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(input).toHaveValue(100)
    })
    expect(input).toHaveAttribute('readonly')
    expect(defaultProps.onChange).not.toHaveBeenCalled()
  })

  it('sets value to recommended when recommended button is clicked', async () => {
    render(<InplaceEditAmountField {...defaultProps} recommendedValue="500" />)

    const recommendedButton = screen.getByRole('button', { name: /500/i })
    userEvent.click(recommendedButton)

    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '500' },
        }),
      )
    })
  })
})
