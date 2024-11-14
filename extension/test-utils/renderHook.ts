import { sleep } from '@/utils'
import {
  renderHook as renderHookBase,
  RenderHookOptions,
} from '@testing-library/react'

type Fn<Result, Props> = (props: Props) => Result

export const renderHook = async <Result, Props>(
  fn: Fn<Result, Props>,
  options?: RenderHookOptions<Props>
) => {
  const result = renderHookBase<Result, Props>(fn, options)

  await sleep(1)

  return result
}
