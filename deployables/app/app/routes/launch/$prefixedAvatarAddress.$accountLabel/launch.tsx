import { createRouteId } from '@zodiac/modules'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/launch'

export async function loader({ params, request }: Route.LoaderArgs) {
  const { prefixedAvatarAddress, accountLabel } = params

  const url = new URL(request.url)
  const setup = url.searchParams.get('setup')
  const callback = url.searchParams.get('callback')

  // Create a temporary route with the provided avatar
  const temporaryRoute: ExecutionRoute = {
    id: createRouteId(),
    label: decodeURIComponent(accountLabel),
    avatar: `${chainPrefix}:${address.toLowerCase()}` as any,
  }

  // Store the callback and setup calls in session storage for later use
  if (callback || setupCalls.length > 0) {
    sessionStorage.setItem(
      `pilot_launch_${temporaryRoute.id}`,
      JSON.stringify({
        callback: callback ? decodeURIComponent(callback) : null,
        setupCalls,
        temporary: true,
      }),
    )
  }

  // Redirect to the edit route with the encoded temporary route
  return redirect(
    href('/edit/:routeId/:data', {
      routeId: temporaryRoute.id,
      data: encode(temporaryRoute),
    }),
  )
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  try {
    // Execute RPC calls on the client side before proceeding
    const routeId = window.location.pathname.split('/').slice(-2)[0]
    const launchDataKey = `pilot_launch_${routeId}`
    const launchData = sessionStorage.getItem(launchDataKey)

    if (launchData) {
      const { setupCalls } = JSON.parse(launchData)

      if (setupCalls && setupCalls.length > 0) {
        const provider = (window as any).ethereum

        if (!provider) {
          console.warn('No ethereum provider found, skipping RPC setup calls')
        } else {
          for (const rpcCall of setupCalls) {
            try {
              console.log('Executing RPC call:', rpcCall.method)
              const result = await provider.request({
                method: rpcCall.method,
                params: rpcCall.params || [],
              })
              console.log('RPC call result:', result)
            } catch (error) {
              console.error(
                'Failed to execute RPC call:',
                rpcCall.method,
                error,
              )
              // Continue with other calls even if one fails
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in clientLoader:', error)
  }

  return serverLoader()
}
