import { useCallback, useMemo } from 'react'

import { pushLocation, useLocation } from './location'

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
  if (location.startsWith('settings')) {
    const semiIndex = location.indexOf(';')
    return semiIndex >= 0 ? location.substring(semiIndex + 1) : ''
  } else {
    return location
  }
}

export const useSettingsHash = (connectionId?: string) => {
  const url = useUrl()
  const settingsPart = connectionId ? `settings-${connectionId}` : 'settings'
  return '#' + encodeURIComponent(`${settingsPart};${url}`)
}

export const usePushSettingsRoute = () => {
  const url = useUrl()
  return useCallback(
    (connectionId?: string) => {
      const settingsPart = connectionId
        ? `settings-${connectionId}`
        : 'settings'
      pushLocation(`${settingsPart};${url}`)
    },
    [url]
  )
}
