import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExtensionVersionContext } from './ExtensionVersionContext'
import { MinimumVersion } from './MinimumVersion'

describe('MinimumVersion', () => {
  it('renders nothing if the current version is too low', () => {
    render(
      <ExtensionVersionContext value="2">
        <MinimumVersion version="3">Test</MinimumVersion>
      </ExtensionVersionContext>,
    )

    expect(screen.queryByText('Test')).not.toBeInTheDocument()
  })

  it('renders its children if the current version is higher', () => {
    render(
      <ExtensionVersionContext value="3">
        <MinimumVersion version="2">Test</MinimumVersion>
      </ExtensionVersionContext>,
    )

    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders its children if the current version matches exactly', () => {
    render(
      <ExtensionVersionContext value="3">
        <MinimumVersion version="3">Test</MinimumVersion>
      </ExtensionVersionContext>,
    )

    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
