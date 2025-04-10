import { featureSchema } from '@zodiac/db/schema'
import { z } from 'zod'
import { api, type FetchOptions } from './api'

const schema = z.object({ features: featureSchema.array() })

export const getFeatures = async ({ signal }: FetchOptions = {}) => {
  const { features } = await api('/extension/features', {
    schema,
    signal,
  })

  return features.map((feature) => feature.name)
}
