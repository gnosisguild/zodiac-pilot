import type { ComponentType } from 'react'
import type { ActionFunction, LoaderFunction } from 'react-router'

type Route = {
  path: string
  Component: ComponentType
  loader?: LoaderFunction
  action?: ActionFunction
}

export const render = () => {}
