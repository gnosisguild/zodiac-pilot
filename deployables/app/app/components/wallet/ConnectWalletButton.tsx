import { Address, PrimaryButton, SecondaryButton } from '@zodiac/ui'
import { LaunchConnectKit } from './LaunchConnectKit'

export const ConnectWalletButton = ({
  connectLabel,
  connectedLabel,
}: {
  connectedLabel: string
  connectLabel: string
}) => (
  <LaunchConnectKit>
    {({ show, address }) =>
      address == null ? (
        <PrimaryButton onClick={show}>{connectLabel}</PrimaryButton>
      ) : (
        <div className="flex items-center gap-4">
          {connectedLabel}

          <SecondaryButton onClick={show}>
            <Address shorten>{address}</Address>
          </SecondaryButton>
        </div>
      )
    }
  </LaunchConnectKit>
)
