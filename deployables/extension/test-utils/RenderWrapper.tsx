import { ProvidePort } from '@/port-handling'
import { type PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren

export const RenderWrapper = ({ children }: RenderWraperProps) => (
  <ProvidePort>{children}</ProvidePort>
)
