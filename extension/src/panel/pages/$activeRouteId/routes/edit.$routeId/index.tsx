import { EditRoute as Component, loader } from './EditRoute'

export const EditRoute = {
  path: ':routeId',
  element: <Component />,
  loader,
}
