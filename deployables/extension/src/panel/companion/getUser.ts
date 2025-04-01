import { getCompanionAppUrl } from '@zodiac/env'
import { z } from 'zod'

const authSchema = z.object({
  user: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
    })
    .nullable(),
})

export const getUser = async () => {
  const heartbeat = await fetch(`${getCompanionAppUrl()}/extension/heartbeat`)

  const { user } = authSchema.parse(await heartbeat.json())

  return user
}
