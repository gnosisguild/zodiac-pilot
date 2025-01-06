import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CopyToClipboard } from './CopyToClipboard'

describe('Copy to clipboard', () => {
  it('is possible to copy data with BigInt values', async () => {
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText')

    render(<CopyToClipboard data={{ value: 1n }}>Copy</CopyToClipboard>)

    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))

    expect(clipboardSpy).toHaveBeenCalledWith(
      JSON.stringify({ value: '1' }, undefined, 2),
    )
  })
})
