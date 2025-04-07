import { Page } from '@/components'
import { createWallet, dbClient, getWallets } from '@/db'
import { useIsPending } from '@/hooks'
import { Widgets } from '@/workOS/client'
import { authKitAction, authKitLoader } from '@/workOS/server'
import { signOut } from '@workos-inc/authkit-react-router'
import { UserProfile, UserSecurity, UserSessions } from '@workos-inc/widgets'
import { getHexString, getString } from '@zodiac/form-data'
import {
  Address,
  AddressInput,
  Form,
  FormLayout,
  GhostButton,
  InlineForm,
  Modal,
  PrimaryButton,
  SecondaryButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from '@zodiac/ui'
import { useState } from 'react'
import type { Route } from './+types/profile'

export const loader = (args: Route.LoaderArgs) => {
  return authKitLoader(
    args,
    async ({
      context: {
        auth: { user, sessionId, accessToken },
      },
    }) => {
      return {
        accessToken,
        sessionId,
        wallets: await getWallets(dbClient(), user.id),
      }
    },
    {
      ensureSignedIn: true,
    },
  )
}

export const action = async (args: Route.ActionArgs) =>
  authKitAction(
    args,
    async ({
      request,
      context: {
        auth: { user },
      },
    }) => {
      const data = await request.formData()

      switch (getString(data, 'intent')) {
        case Intent.SignOut: {
          return await signOut(request)
        }

        case Intent.AddWallet: {
          const label = getString(data, 'label')
          const address = getHexString(data, 'address')

          await createWallet(dbClient(), user, { label, address })
        }
      }
    },
    { ensureSignedIn: true },
  )

const Profile = ({
  loaderData: { accessToken, sessionId, wallets },
}: Route.ComponentProps) => {
  const signingOut = useIsPending()

  return (
    <Page>
      <Page.Header>Profile</Page.Header>
      <Page.Main>
        <Widgets>
          <FormLayout>
            <FormLayout.Section title="Personal information">
              <UserProfile authToken={accessToken} />
            </FormLayout.Section>

            <FormLayout.Section title="Security">
              <UserSecurity authToken={accessToken} />
            </FormLayout.Section>

            <FormLayout.Section title="Sessions">
              <UserSessions
                authToken={accessToken}
                currentSessionId={sessionId}
              />
            </FormLayout.Section>

            <FormLayout.Section title="Wallets">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Label</TableHeader>
                    <TableHeader>Address</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>{wallet.label}</TableCell>
                      <TableCell>
                        <Address>{wallet.address}</Address>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <AddWallet />
              </div>
            </FormLayout.Section>

            <FormLayout.Actions>
              <InlineForm>
                <SecondaryButton
                  submit
                  intent={Intent.SignOut}
                  busy={signingOut}
                  style="critical"
                >
                  Sign out
                </SecondaryButton>
              </InlineForm>
            </FormLayout.Actions>
          </FormLayout>
        </Widgets>
      </Page.Main>
    </Page>
  )
}

const AddWallet = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SecondaryButton onClick={() => setOpen(true)}>
        Add Wallet
      </SecondaryButton>

      <Modal
        open={open}
        closeLabel="Cancel"
        onClose={() => setOpen(false)}
        title="Add Wallet"
      >
        <Form intent={Intent.AddWallet}>
          <TextInput label="Label" name="label" placeholder="Label" />
          <AddressInput label="Address" name="address" />

          <Modal.Actions>
            <PrimaryButton submit>Add</PrimaryButton>
            <GhostButton onClick={() => setOpen(false)}>Cancel</GhostButton>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}

export default Profile

enum Intent {
  SignOut = 'SignOut',
  AddWallet = 'AddWallet',
}
