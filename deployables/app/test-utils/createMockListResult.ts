import { AutoPaginatable } from '@workos-inc/node'

export const createMockListResult = <T>(data: T[] = []) => {
  return new AutoPaginatable<T>(
    { listMetadata: {}, data, object: 'list' },
    async () => ({ data, listMetadata: {}, object: 'list' }),
    {},
  )
}
