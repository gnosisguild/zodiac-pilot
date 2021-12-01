import React, { useState } from 'react'

import { useWalletConnectProvider } from '../WalletConnectProvider'
import { Box, Button, Flex } from '../components'
import { pushLocation } from '../location'

import classes from './style.module.css'
import { useSafeModuleInfo } from './useSafeModuleInfo'

//const DAO_SAFE = '0x5f4E63608483421764fceEF23F593A5d0D6C9F4D'
const DAO_SAFE = '0x87eb5f76c3785936406fa93654f39b2087fd8068'

const Field: React.FC<{ label?: string }> = ({ label, children }) => (
  <Box double bg p={3}>
    {label ? (
      <label>
        <div>{label}</div>
        {children}
      </label>
    ) : (
      children
    )}
  </Box>
)

const Settings: React.FC<{ url: string }> = ({ url: initialUrl }) => {
  const [avatarAddress, setAvatarAddress] = useState(
    localStorage.getItem('avatarAddress') || DAO_SAFE
  )
  const [targetAddress, setTargetAddress] = useState(
    localStorage.getItem('targetAddress') || DAO_SAFE
  )

  const [url, setUrl] = useState(initialUrl)
  const { provider, connected } = useWalletConnectProvider()

  const { loading, isValidSafe, enabledModules } =
    useSafeModuleInfo(avatarAddress)

  const submit = () => {
    localStorage.setItem('avatarAddress', avatarAddress)
    localStorage.setItem('targetAddress', targetAddress)
    pushLocation(url)
  }

  return (
    <div className={classes.container}>
      <h1>Transaction Pilot</h1>

      <Box double p={3}>
        <Flex direction="column" gap={3}>
          <Box p={3}>
            <Flex direction="column" gap={3}>
              <Field label="DAO Safe">
                <input
                  type="text"
                  value={avatarAddress}
                  onChange={(ev) => {
                    setAvatarAddress(ev.target.value)
                    setTargetAddress(ev.target.value)
                  }}
                />
              </Field>

              <Field label="Zodiac Modifier or Module Address">
                <select
                  onChange={(a) => {
                    setTargetAddress(a.target.value)
                  }}
                  value={targetAddress}
                  disabled={loading || !isValidSafe}
                >
                  <option key={avatarAddress}>{avatarAddress}</option>
                  {enabledModules.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>

              <Field>
                {connected ? (
                  <>
                    <span>connected to {provider.accounts[0]}</span>
                    <Button onClick={() => provider.disconnect()}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={async () => {
                      try {
                        await provider.disconnect()
                        await provider.enable()
                      } catch (e) {
                        // When the user dismisses the modal, the connectors stays in a pending state and the modal won't open again.
                        // This fixes it:
                        // @ts-expect-error signer is a private property, but we didn't find another way
                        provider.signer.disconnect()
                      }
                    }}
                  >
                    Connect Pilot Account
                  </Button>
                )}
              </Field>
            </Flex>
          </Box>

          <Box p={3}>
            <Flex direction="column" gap={3}>
              <div>Select or enter a Dapp to use</div>

              <Field label="Dapp Url">
                <input
                  type="text"
                  value={url}
                  placeholder="https://any.app"
                  onChange={(ev) => {
                    setUrl(ev.target.value)
                  }}
                />
              </Field>
            </Flex>
          </Box>

          <Button
            disabled={!url || !avatarAddress || !targetAddress}
            onClick={submit}
          >
            Start Transaction Pilot
          </Button>
        </Flex>
      </Box>
    </div>
  )
}

export default Settings
