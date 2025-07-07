import { authorizedAction } from '@/auth-server'
import {
  ConnectWalletButton,
  OnlyConnected,
  Page,
  useConnected,
} from '@/components'
import { ChainSelect } from '@/routes-ui'
import { isSmartContractAddress, jsonRpcProvider, routeTitle } from '@/utils'
import { Chain, verifyChainId } from '@zodiac/chains'
import {
  getBoolean,
  getHexString,
  getInt,
  getOptionalString,
} from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createBlankRoute,
  updateAvatar,
  updateChainId,
  updateLabel,
} from '@zodiac/modules'
import { AddressInput, Error, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect } from 'react-router'
import type { Route } from './+types/create'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'New local Safe account') },
]

export const action = (args: Route.ActionArgs) =>
  authorizedAction(args, async ({ request }) => {
    const data = await request.formData()

    const label = getOptionalString(data, 'label')
    const avatar = getHexString(data, 'avatar')
    const chainId = verifyChainId(getInt(data, 'chainId'))

    if (!(await isSmartContractAddress(jsonRpcProvider(chainId), avatar))) {
      return { error: 'Account is not a smart contract' }
    }

    let route = createBlankRoute()

    if (label != null) {
      route = updateLabel(route, label)
    }

    route = updateChainId(updateAvatar(route, { safe: avatar }), chainId)

    return { route }
  })

export const clientAction = async ({
  request,
  serverAction,
}: Route.ClientActionArgs) => {
  const data = await request.clone().formData()

  const { route, error } = await serverAction()

  if (error != null) {
    return { error }
  }

  if (getBoolean(data, 'connected')) {
    const { promise, resolve } = Promise.withResolvers<void>()

    companionRequest(
      { type: CompanionAppMessageType.SAVE_AND_LAUNCH, data: route },
      () => resolve(),
    )

    await promise
  }

  return redirect(href(`/offline/accounts`))
}

const CreateLocalAccount = ({ actionData }: Route.ComponentProps) => {
  const connected = useConnected()

  return (
    <Page>
      <Page.Header
        action={
          <ConnectWalletButton
            connectLabel="Connect Pilot Signer"
            connectedLabel="Pilot Signer"
          />
        }
      >
        New local Safe Account
      </Page.Header>

      <Page.Main>
        <OnlyConnected>
          <Form context={{ connected }}>
            {actionData && (
              <Error title="Could not create account">{actionData.error}</Error>
            )}

            <TextInput
              label="Label"
              name="label"
              placeholder="Give this account a descriptive name"
            />

            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-2">
                <ChainSelect name="chainId" defaultValue={Chain.ETH} />
              </div>

              <div className="col-span-4">
                <AddressInput required label="Address" name="avatar" />
              </div>
            </div>

            <Form.Actions>
              <PrimaryButton submit busy={useIsPending()}>
                Create
              </PrimaryButton>
            </Form.Actions>
          </Form>
        </OnlyConnected>
      </Page.Main>
    </Page>
  )
}

export default CreateLocalAccount
