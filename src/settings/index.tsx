import React, { useState } from 'react'

import { prependHttp } from '../browser/UrlInput'
import { Box, Button, Flex, Select } from '../components'
import { AppSearch } from '../components'
import { pushLocation } from '../location'

import ConnectButton from './ConnectButton'
import classes from './style.module.css'
import useAddressDryRun from './useAddressDryRun'
import { useSafeModuleInfo } from './useSafeModuleInfo'

const Field: React.FC<{ label?: string }> = ({ label, children }) => (
  <Box double bg p={3}>
    {label ? (
      <label>
        <div className={classes.fieldLabel}>{label}</div>
        {children}
      </label>
    ) : (
      children
    )}
  </Box>
)

const Settings: React.FC<{ url: string }> = ({ url: initialUrl }) => {
  const [avatarAddress, setAvatarAddress] = useState(
    localStorage.getItem('avatarAddress') || ''
  )
  const [moduleAddress, setModuleAddress] = useState(
    localStorage.getItem('moduleAddress') || ''
  )

  const [url, setUrl] = useState(initialUrl)

  const { loading, isValidSafe, enabledModules } =
    useSafeModuleInfo(avatarAddress)

  const submit = (appUrl: string) => {
    localStorage.setItem('avatarAddress', avatarAddress)
    localStorage.setItem('moduleAddress', moduleAddress)
    pushLocation(prependHttp(appUrl))
  }

  const error = useAddressDryRun({ avatarAddress, moduleAddress })

  return (
    <div className={classes.container}>
      <h1>Zodiac Pilot</h1>

      <Box double p={3}>
        <Flex direction="column" gap={3}>
          <Box p={3}>
            <p className="intro-text">
              This app allows you to control a Safe via a Zodiac modifier from
              an enabled account. <a href="#docs">Read more here.</a>
            </p>
          </Box>
          <Box p={3}>
            <Flex direction="column" gap={3}>
              <Field label="DAO Safe">
                <input
                  type="text"
                  value={avatarAddress}
                  onChange={(ev) => {
                    setAvatarAddress(ev.target.value)
                    setModuleAddress(ev.target.value)
                  }}
                />
              </Field>

              <Field label="Zodiac Modifier or Module Address">
                <Select
                  options={[
                    { value: avatarAddress, label: avatarAddress },
                    ...enabledModules.map((address) => ({
                      value: address,
                      label: address,
                    })),
                  ]}
                  onChange={(selected: { value: string; label: string }) => {
                    setModuleAddress(selected.value)
                  }}
                  value={{ value: moduleAddress, label: moduleAddress }}
                  disabled={loading || !isValidSafe}
                />
              </Field>

              <Field>
                <ConnectButton />
              </Field>

              {error && (
                <>
                  <div>
                    There seems to be a problem with the entered addresses:
                  </div>
                  <Box p={3} className={classes.error}>
                    {error}
                  </Box>
                </>
              )}
            </Flex>
          </Box>

          <Box p={3}>
            <Flex direction="column" gap={3}>
              <div>Select or enter a Dapp to use</div>
              <AppSearch onPick={submit} />
              <Field label="Dapp Url">
                <input
                  type="text"
                  value={url}
                  placeholder="https://any.app"
                  onChange={(ev) => {
                    setUrl(ev.target.value)
                  }}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      if (url && avatarAddress && moduleAddress) {
                        submit(url)
                      }
                    }
                  }}
                />
              </Field>
            </Flex>
          </Box>

          <Button
            disabled={!url || !avatarAddress || !moduleAddress}
            onClick={() => {
              submit(url)
            }}
          >
            Launch
          </Button>
        </Flex>
      </Box>
    </div>
  )
}

export default Settings
