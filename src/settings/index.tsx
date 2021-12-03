import React, { useState } from 'react'

import { useWalletConnectProvider } from '../WalletConnectProvider'
import { prependHttp } from '../browser/UrlInput'
import { AppPicker, Box, Button, Flex, Select } from '../components'
import walletConnectLogoUrl from '../images/wallet-connect-logo.png'
import { pushLocation } from '../location'

import classes from './style.module.css'
import { useSafeModuleInfo } from './useSafeModuleInfo'

//const DAO_SAFE = '0x5f4E63608483421764fceEF23F593A5d0D6C9F4D'
const DAO_SAFE = '0x87eb5f76c3785936406fa93654f39b2087fd8068'

const Field: React.FC<{ label?: string }> = ({ label, children }) => (
  <Box double bg p={3}>
    {label ? (
      <label>
        <div className="field-label">{label}</div>
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

  const submit = (appUrl: string) => {
    localStorage.setItem('avatarAddress', avatarAddress)
    localStorage.setItem('targetAddress', targetAddress)
    pushLocation(prependHttp(appUrl))
  }

  const targetOptions = [
    { value: targetAddress, label: targetAddress },
    ...enabledModules.map((address) => ({ value: address, label: address })),
  ]

  const shortAddress = (address: string) => {
    return address.substr(0, 7) + '...' + address.substr(-5)
  }

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
                    setTargetAddress(ev.target.value)
                  }}
                />
              </Field>

              <Field label="Zodiac Modifier or Module Address">
                <Select
                  options={targetOptions}
                  onChange={(selected: { value: string; label: string }) => {
                    setTargetAddress(selected.value)
                  }}
                  value={{ value: targetAddress, label: targetAddress }}
                  disabled={loading || !isValidSafe}
                />
              </Field>

              <Field>
                {connected ? (
                  <div>
                    <div>Pilot Account</div>
                    <div className={classes.connectedAccount}>
                      <div className={classes.walletLogo}>
                        <img
                          src={walletConnectLogoUrl}
                          alt="wallet connect logo"
                        />
                      </div>
                      <div className={classes.connectedAddress}>
                        {shortAddress(provider.accounts[0])}
                      </div>
                      <Button
                        onClick={() => provider.disconnect()}
                        className={classes.disconnectButton}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
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
                    <img src={walletConnectLogoUrl} alt="wallet connect logo" />
                    Connect Pilot Account
                  </Button>
                )}
              </Field>
            </Flex>
          </Box>

          <Box p={3}>
            <Flex direction="column" gap={3}>
              <div>Select or enter a Dapp to use</div>
              <AppPicker onPick={submit} />
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
                      if (url && avatarAddress && targetAddress) {
                        submit(url)
                      }
                    }
                  }}
                />
              </Field>
            </Flex>
          </Box>

          <Button
            disabled={!url || !avatarAddress || !targetAddress}
            onClick={() => {
              submit(url)
            }}
          >
            Takeoff
          </Button>
        </Flex>
      </Box>
    </div>
  )
}

export default Settings
