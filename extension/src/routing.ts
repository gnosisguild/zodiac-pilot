import { useCallback, useMemo } from 'react'

import { replaceLocation, useLocation } from './location'

export const useMatchSettingsRoute = () => {
  const location = useLocation()
  const [settingsPart, url = ''] = location.split(';')
  const settingsRouteMatch = settingsPart.match(/^settings(-[A-Za-z0-9_-]+)?/)
  const editConnectionId = settingsRouteMatch?.[1]?.slice(1)
  const isMatch = !!settingsRouteMatch

  return useMemo(
    () => isMatch && { editConnectionId, url },
    [isMatch, editConnectionId, url]
  )
}

export const useUrl = () => {
  const location = useLocation()
  if (location.startsWith('settings') || location.startsWith('connections')) {
    const semiIndex = location.indexOf(';')
    return semiIndex >= 0 ? location.substring(semiIndex + 1) : ''
  } else {
    return location
  }
}

export const useMatchConnectionsRoute = () => {
  const location = useLocation()
  const [connectionsPart, url = ''] = location.split(';')
  const connectionsRouteMatch = connectionsPart.match(
    /^connections(-[A-Za-z0-9_-]+)?/
  )
  const editConnectionId = connectionsRouteMatch?.[1]?.slice(1)
  const isMatch = !!connectionsRouteMatch

  return useMemo(
    () => ({ isMatch, editConnectionId, url }),
    [isMatch, editConnectionId, url]
  )
}

export const useConnectionsHash = (connectionId?: string) => {
  const url = useUrl()
  const connectionsPart = connectionId
    ? `connections-${connectionId}`
    : 'connections'
  return '#' + encodeURIComponent(`${connectionsPart};${url}`)
}

export const usePushConnectionsRoute = () => {
  const url = useUrl()
  return useCallback(
    (connectionId?: string) => {
      const connectionsPart = connectionId
        ? `connections-${connectionId}`
        : 'connections'
      replaceLocation(`${connectionsPart};${url}`)
    },
    [url]
  )
}
