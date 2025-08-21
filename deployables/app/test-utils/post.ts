import { authkitLoader } from '@workos-inc/authkit-react-router'
import { Organization } from '@workos-inc/node'
import { Tenant, User } from '@zodiac/db/schema'
import { createPost } from '@zodiac/test-utils'
import { data, type Register } from 'react-router'
import { vi } from 'vitest'
import { default as routes } from '../app/routes'
import { createAuth } from './render'
import { mockWorkOs } from './workOS'

const basePost = await createPost<Register, typeof routes>(
  new URL(/* @vite-ignore */ '../app', import.meta.url),
  routes,
)

const mockAuthKitLoader = vi.mocked(authkitLoader)

type SignedInOptions = {
  /**
   * Post to the route in a logged in context
   */
  tenant: Tenant

  /**
   * Post to the route in a logged in context
   */
  user: User

  /**
   * Stub for the work OS organization that should
   * belong to the tenant
   */
  workOsOrganization?: Partial<Organization>

  /** Setup org in a way that user is considered a system admin */
  isSystemAdmin?: boolean
}

type SignedOutOptions = {
  tenant?: null
  user?: null
  workOsOrganization?: null
  isSystemAdmin?: false
}

type PostOptions = SignedInOptions | SignedOutOptions

export const post = (
  path: string,
  body: FormData,
  options: PostOptions = {},
) => {
  const workOsUser = mockWorkOs(options)
  const auth = createAuth(workOsUser)

  mockAuthKitLoader.mockImplementation(async (loaderArgs, loaderOrOptions) => {
    if (loaderOrOptions != null && typeof loaderOrOptions === 'function') {
      const loaderResult = await loaderOrOptions({
        ...loaderArgs,
        auth,
        getAccessToken() {
          if (workOsUser == null) {
            return null
          }

          return ''
        },
      })

      return data({ ...loaderResult, ...auth })
    }

    return data({ ...auth })
  })

  return basePost(path, body, {
    auth: {
      ...auth,
      user: options.user,
      tenant: options.tenant,
      workOsUser: auth.user,
    },
  })
}
