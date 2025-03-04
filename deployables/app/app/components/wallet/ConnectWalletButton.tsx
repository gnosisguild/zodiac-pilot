import { verifyHexAddress } from '@zodiac/schema'
import { Address, SecondaryButton } from '@zodiac/ui'
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
        <SecondaryButton onClick={show}>{connectLabel}</SecondaryButton>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-300">
            {connectedLabel}
          </span>

          <SecondaryButton onClick={show}>
            <Address shorten>{verifyHexAddress(address)}</Address>
          </SecondaryButton>
        </div>
      )
    }
  </LaunchConnectKit>
)
