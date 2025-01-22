import { Labeled, PrimaryButton } from '@zodiac/ui'

export const ConnectWalletFallback = () => (
  <Labeled label="Pilot Account">
    <PrimaryButton fluid disabled>
      Loading wallet support...
    </PrimaryButton>
  </Labeled>
)
