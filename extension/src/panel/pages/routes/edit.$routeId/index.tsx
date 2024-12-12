import { action, EditRoute as Component, loader } from './EditRoute'

export const EditRoute = {
  path: 'edit/:routeId',
  element: <Component />,
  loader,
  action,
}
