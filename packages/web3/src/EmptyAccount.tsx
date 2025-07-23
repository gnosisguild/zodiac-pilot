import { Labeled, PrimaryButton } from '@zodiac/ui'
import { LaunchConnectKit, type OnConnectArgs } from './LaunchConnectKit'

type Props = {
  onConnect?: (args: OnConnectArgs) => void
}

export const EmptyAccount = ({ onConnect }: Props) => {
  return (
    <LaunchConnectKit onConnect={onConnect}>
      {({ show }) => (
        <Labeled label="Pilot Signer">
          <PrimaryButton onClick={show}>Connect wallet</PrimaryButton>
        </Labeled>
      )}
    </LaunchConnectKit>
  )
}
