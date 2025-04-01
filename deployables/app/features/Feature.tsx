import type { PropsWithChildren } from 'react'
import { useFeatures } from './FeatureContext'

type FeatureProps = PropsWithChildren<{ feature: string }>

export const Feature = ({ feature, children }: FeatureProps) => {
  const features = useFeatures()

  if (features.includes(feature)) {
    return children
  }

  return null
}
