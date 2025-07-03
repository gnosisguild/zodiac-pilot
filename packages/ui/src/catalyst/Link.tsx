/**
 * TODO: Update this component to use your client-side framework's link
 * component. We've provided examples of how to do this for Next.js, Remix, and
 * Inertia.js in the Catalyst documentation:
 *
 * https://catalyst.tailwindui.com/docs#client-side-router-integration
 */

import * as Headless from '@headlessui/react'
import React from 'react'
import { Link as RouterLink } from 'react-router'

export const Link = (props: React.ComponentProps<typeof RouterLink>) => {
  return (
    <Headless.DataInteractive>
      <RouterLink {...props} />
    </Headless.DataInteractive>
  )
}
