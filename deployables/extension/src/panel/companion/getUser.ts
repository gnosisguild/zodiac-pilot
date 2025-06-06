import { z } from 'zod'
import { api, type FetchOptions } from './api'

const authSchema = z.object({
  user: z
    .object({
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable(),
})

export type User = z.infer<typeof authSchema>['user']

export const getUser = async ({ signal }: FetchOptions = {}) => {
  const { user } = await api('/extension/heartbeat', {
    schema: authSchema,
    signal,
  })

  return user
}
