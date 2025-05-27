import { ProvideAccount, toLocalAccount, type TaggedAccount } from '@/accounts'
import { toAccount } from '@/companion'
import { ProvideTransactions, type State } from '@/transactions'
import {
  createMockExecutionRoute,
  renderHook as renderHookBase,
  type RenderHookOptions,
} from '@zodiac/test-utils'
import { Fragment, type PropsWithChildren } from 'react'
import { mockActiveTab, mockRuntimeConnect } from './chrome'
import { createTransactionState } from './creators'

type Fn<Result, Props> = (props: Props) => Result

type ExtendedOptions = {
  activeTab?: Partial<chrome.tabs.Tab>

  account?: TaggedAccount

  initialState?: Partial<State>
}

export const renderHook = async <Result, Props>(
  fn: Fn<Result, Props>,
  {
    activeTab,
    account = toLocalAccount(toAccount(createMockExecutionRoute())),
    wrapper: Wrapper = Fragment,
    initialState,

    ...options
  }: RenderHookOptions<Props> & ExtendedOptions = {},
) => {
  const mockedTab = mockActiveTab(activeTab)
  const mockedRuntimePort = mockRuntimeConnect()

  const FinalWrapper = ({ children }: PropsWithChildren) => (
    <RenderWrapper
      account={account}
      initialState={createTransactionState(initialState)}
    >
      <Wrapper>{children}</Wrapper>
    </RenderWrapper>
  )

  const result = await renderHookBase<Result, Props>(fn, {
    ...options,
    wrapper: FinalWrapper,
  })

  return { ...result, mockedTab, mockedRuntimePort }
}

type RenderWrapperProps = PropsWithChildren<{
  account: TaggedAccount
  initialState: State
}>

const RenderWrapper = ({
  account,
  initialState,
  children,
}: RenderWrapperProps) => (
  <ProvideAccount account={account}>
    <ProvideTransactions initialState={initialState}>
      {children}
    </ProvideTransactions>
  </ProvideAccount>
)
