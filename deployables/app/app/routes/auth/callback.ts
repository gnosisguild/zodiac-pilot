import { authLoader } from '@workos-inc/authkit-remix'
import type { LoaderFunction } from 'react-router'

export const loader: LoaderFunction = authLoader({
  onSuccess(data) {
    console.log(data)
  },
})
