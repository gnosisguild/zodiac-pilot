import React, { useState } from 'react'

import { AppSearch, Box, Button, Flex, Select } from '../components'

import ConnectButton from './ConnectButton'
import classes from './style.module.css'
import useAddressDryRun from './useAddressDryRun'
import { useSafeModuleInfo } from './useSafeModuleInfo'

type Props = {
  url: string
  moduleAddress: string
  avatarAddress: string
  onLaunch(
    url: string,
    moduleAddress: string,
    avatarAddress: string,
    roleId: string
  ): void
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
  const [moduleAddress, setModuleAddress] = useState<string | undefined>(
    initialModuleAddress
  )
  const [avatarAddress, setAvatarAddress] = useState(initialAvatarAddress)
  const [roleId, setRoleId] = useState('')

  const { loading, isValidSafe, enabledModules } =
    useSafeModuleInfo(avatarAddress)

  const error = useAddressDryRun({
    avatarAddress,
    moduleAddress: moduleAddress || '',
    roleId,
  })

  const canLaunch =
    !loading && !error && url && moduleAddress && avatarAddress && roleId

  return (
    <div className={classes.container}>
      <h1>Zodiac Pilot</h1>

      <Box double p={3}>
        <Flex direction="column" gap={3}>
          <Box p={3}>
            <p className="intro-text">
              This app allows you to control a Safe via a Zodiac modifier from
              an enabled account.
            </p>
          </Box>
          <Box p={3}>
            <Flex direction="column" gap={3}>
              <Field label="DAO Safe">
                <input
                  type="text"
                  value={avatarAddress}
                  onChange={(ev) => {
                    setModuleAddress(undefined)
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
                      : ''
                  }
                  isDisabled={loading || !isValidSafe}
                  placeholder={loading || !isValidSafe ? '' : 'Select a module'}
                  noOptionsMessage={() => 'No modules are enabled on this Safe'}
                />
              </Field>

              <Field label="Role ID">
                <input
                  type="text"
                  value={roleId}
                  onChange={(ev) => {
                    setRoleId(ev.target.value)
                  }}
                  placeholder="0"
                />
              </Field>

              <Field>
                <ConnectButton />
              </Field>

              {error && (
                <>
                  <div>
                    There seems to be a problem with this configuration:
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
                    onLaunch(url, moduleAddress, avatarAddress, roleId)
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
                      onLaunch(url, moduleAddress, avatarAddress, roleId)
                    }
                  }}
                />
              </Field>
            </Flex>
          </Box>

          <Button
            disabled={!canLaunch}
            onClick={() => {
              onLaunch(url, moduleAddress || '', avatarAddress, roleId)
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
