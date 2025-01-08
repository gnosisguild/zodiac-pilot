import {
  queries,
  renderHook as renderHookBase,
  type Queries,
  type RenderHookOptions as RenderHookOptionsBase,
} from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import type {
  hydrateRoot,
  Container as ReactDomContainer,
} from 'react-dom/client'
import { TestElement, waitForTestElement } from './TestElement'
import { sleepTillIdle } from './sleepTillIdle'

type Fn<Result, Props> = (props: Props) => Result

type HydrateableContainer = Parameters<typeof hydrateRoot>[0]

export type RenderHookOptions<
  Props,
  Q extends Queries = typeof queries,
  Container extends ReactDomContainer | HydrateableContainer = HTMLElement,
  BaseElement extends ReactDomContainer | HydrateableContainer = Container,
> = RenderHookOptionsBase<Props, Q, Container, BaseElement>

export const renderHook = async <Result, Props>(
  fn: Fn<Result, Props>,
  {
    wrapper: Wrapper = ({ children }: PropsWithChildren) => <>{children}</>,
    ...options
  }: RenderHookOptionsBase<Props> = {},
) => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <Wrapper>
      <TestElement>{children}</TestElement>
    </Wrapper>
  )

  const result = renderHookBase<Result, Props>(fn, { ...options, wrapper })

  await waitForTestElement()
  await sleepTillIdle()

  return result
}
