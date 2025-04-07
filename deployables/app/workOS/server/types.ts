import type { User } from '@/db'
import type {
  AuthorizedData as WorkOsAuthorizedData,
  UnauthorizedData as WorkOsUnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'

export type AuthorizedData = Omit<WorkOsAuthorizedData, 'user'> & {
  user: User
  workOsUser: WorkOsAuthorizedData['user']
}

export type UnauthorizedData = Omit<WorkOsUnauthorizedData, 'user'> & {
  user: null
  workOsUser: WorkOsUnauthorizedData['user']
}
