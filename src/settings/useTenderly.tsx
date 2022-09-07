import React, { createContext, useContext, useEffect, useState } from 'react'

import { useStickyState } from '../utils'

export type TenderlySettings = {
  accessKey: string
  project: string
  user: string
}

const DEFAULT_VALUE = {
  accessKey: '',
  project: '',
  user: '',
}

export enum TenderlyStatus {
  SETTINGS_INCOMPLETE,
  PENDING,
  SUCCESS,
  NOT_FOUND,
  INVALID_ACCESS_KEY,
}

const TenderlySettingsContext = createContext<TenderlySettings>(DEFAULT_VALUE)
const SetTenderlySettingsContext = createContext<
  (newSettings: TenderlySettings) => void
>(() => {
  throw new Error('Must wrap in <TenderlyProvider>')
})
const TenderlyStatusContext = createContext<TenderlyStatus>(
  TenderlyStatus.SETTINGS_INCOMPLETE
)

export const ProvideTenderlySettings: React.FC = ({ children }) => {
  const [settings, setSettings] = useStickyState<TenderlySettings>(
    DEFAULT_VALUE,
    'tenderlySettings'
  )

  const status = useTenderlyAccessCheck(settings)

  return (
    <TenderlySettingsContext.Provider value={settings}>
      <SetTenderlySettingsContext.Provider value={setSettings}>
        <TenderlyStatusContext.Provider value={status}>
          {children}
        </TenderlyStatusContext.Provider>
      </SetTenderlySettingsContext.Provider>
    </TenderlySettingsContext.Provider>
  )
}

const useTenderly = () => {
  const settings = useContext(TenderlySettingsContext)
  const status = useContext(TenderlyStatusContext)

  return [settings, status] as const
}
export default useTenderly

export const useSetTenderlySettings = () =>
  useContext(SetTenderlySettingsContext)

const useTenderlyAccessCheck = (settings: TenderlySettings) => {
  const [status, setStatus] = useState(TenderlyStatus.PENDING)

  const { user, project, accessKey } = settings

  useEffect(() => {
    if (!user || !project || !accessKey) {
      setStatus(TenderlyStatus.SETTINGS_INCOMPLETE)
      return
    }

    setStatus(TenderlyStatus.PENDING)

    let canceled = false

    const forksApi = `https://api.tenderly.co/api/v1/account/${user}/project/${project}/forks`
    const headers: HeadersInit = new Headers()
    headers.set('X-Access-Key', accessKey)

    fetch(forksApi, {
      headers,
      method: 'GET',
    }).then((res) => {
      if (canceled) return

      if (res.status === 201) {
        // Tenderly uses weird HTTP status codes
        setStatus(TenderlyStatus.SUCCESS)
      } else if (res.status === 404) {
        // Tenderly uses weird HTTP status codes
        setStatus(TenderlyStatus.NOT_FOUND)
      } else {
        setStatus(TenderlyStatus.INVALID_ACCESS_KEY)
      }
    })

    return () => {
      canceled = true
    }
  }, [user, project, accessKey])

  return status
}
