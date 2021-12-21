import React, { useState } from 'react'

import { AppSearch, Box, Button, Flex, Select } from '../components'

import ConnectButton from './ConnectButton'
import isValidAddress from './isValidAddress'
import classes from './style.module.css'
import useAddressDryRun from './useAddressDryRun'
import { useSafeModuleInfo } from './useSafeModuleInfo'

type Props = {
  url: string
  moduleAddress: string
  avatarAddress: string
  onLaunch(url: string, moduleAddress: string, avatarAddress: string): void
}

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

const Settings: React.FC<Props> = ({
  url: initialUrl,
  moduleAddress: initialModuleAddress,
  avatarAddress: initialAvatarAddress,
  onLaunch,
}) => {
  const [url, setUrl] = useState(initialUrl)
  const [moduleAddress, setModuleAddress] = useState(initialModuleAddress)
  const [avatarAddress, setAvatarAddress] = useState(initialAvatarAddress)

  const { loading, isValidSafe, enabledModules } =
    useSafeModuleInfo(avatarAddress)

  const error = useAddressDryRun({ avatarAddress, moduleAddress })

  const canLaunch = !loading && !error && url && moduleAddress && avatarAddress

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
              <Field>
                <ConnectButton />
              </Field>

              <Field label="DAO Safe">
                <input
                  type="text"
                  value={avatarAddress}
                  onChange={(ev) => {
                    setAvatarAddress(ev.target.value)
                  }}
                />
              </Field>

              <Field label="Zodiac Modifier or Module Address">
                <Select
                  options={enabledModules.map((address) => ({
                    value: address,
                    label: address,
                  }))}
                  onChange={(selected) => {
                    setModuleAddress(
                      (selected as { value: string; label: string }).value
                    )
                  }}
                  value={
                    moduleAddress
                      ? { value: moduleAddress, label: moduleAddress }
                      : undefined
                  }
                  isDisabled={loading || !isValidSafe}
                  placeholder={loading || !isValidSafe ? '' : 'Select a module'}
                />
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
              <AppSearch
                onPick={(url) => {
                  setUrl(url)
                  if (canLaunch) {
                    onLaunch(url, moduleAddress, avatarAddress)
                  }
                }}
              />
              <Field label="Dapp Url">
                <input
                  type="text"
                  value={url}
                  placeholder="https://any.app"
                  onChange={(ev) => {
                    setUrl(ev.target.value)
                  }}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter' && canLaunch) {
                      onLaunch(url, moduleAddress, avatarAddress)
                    }
                  }}
                />
              </Field>
            </Flex>
          </Box>

          <Button
            disabled={!canLaunch}
            onClick={() => {
              onLaunch(url, moduleAddress, avatarAddress)
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
