import { sleep } from '@/utils'
import { renderHook as renderHookBase } from '@testing-library/react'

type Fn = Parameters<typeof renderHookBase>[0]
type Options = Parameters<typeof renderHookBase>[1]

export const renderHook = async (fn: Fn, options?: Options) => {
  const result = renderHookBase(fn, options)

  await sleep(1)

  return result
}
