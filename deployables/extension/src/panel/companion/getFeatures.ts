import { featureSchema } from '@zodiac/db'
import { api, type FetchOptions } from './api'

const schema = featureSchema.array()

export const getFeatures = async ({ signal }: FetchOptions = {}) => {
  const features = await api('/extension/features', {
    schema,
    signal,
  })

  return features.map((feature) => feature.name)
}
