import { z } from 'zod'
import { api, type FetchOptions } from './api'

const featureSchema = z.object({ features: z.string().array() })

export const getFeatures = async ({ signal }: FetchOptions = {}) => {
  const { features } = await api('/extension/features', {
    schema: featureSchema,
    signal,
  })

  return features
}
