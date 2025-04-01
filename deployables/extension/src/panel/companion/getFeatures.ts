import { getCompanionAppUrl } from '@zodiac/env'
import { z } from 'zod'

const featureSchema = z.object({ features: z.string().array() })

export const getFeatures = async () => {
  const response = await fetch(`${getCompanionAppUrl()}/extension/features`)

  const { features } = featureSchema.parse(await response.json())

  return features
}
