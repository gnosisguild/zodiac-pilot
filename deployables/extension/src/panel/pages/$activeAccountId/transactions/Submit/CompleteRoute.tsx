import { useAccount } from '@/accounts'
import { useWindowId } from '@/port-handling'
import { Form, PrimaryButton } from '@zodiac/ui'
import { Intent } from '../intents'

export const CompleteRoute = () => {
  const account = useAccount()
  const windowId = useWindowId()

  return (
    <Form context={{ accountId: account.id, windowId }}>
      <PrimaryButton fluid submit intent={Intent.EditAccount}>
        Complete route setup to sign
      </PrimaryButton>
    </Form>
  )
}
