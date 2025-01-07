import { screen } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import { Outlet } from 'react-router'

export const TestElement = ({ children }: PropsWithChildren) => (
  <>
    <div data-testid="test-element-id" />
    <Outlet />
    {children}
  </>
)

export const waitForTestElement = () => screen.findByTestId('test-element-id')
