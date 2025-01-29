import { decode, executionRouteSchema } from '@zodiac/schema'

export const parseRouteData = (routeData: string) => {
  try {
    const rawJson = decode(routeData)

    return executionRouteSchema.parse(rawJson)
  } catch (error) {
    console.error('Error parsing the route from the URL', { error })

    throw new Response(JSON.stringify(error), { status: 400 })
  }
}
