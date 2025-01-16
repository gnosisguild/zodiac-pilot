import { executionRouteSchema } from '@zodiac/schema'

export const parseRouteData = (routeData: string) => {
  const decodedData = atob(routeData)

  try {
    const rawJson = JSON.parse(decodedData.toString())

    return executionRouteSchema.parse(rawJson)
  } catch (error) {
    console.error('Error parsing the route from the URL', { error })

    throw new Response(JSON.stringify(error), { status: 400 })
  }
}
