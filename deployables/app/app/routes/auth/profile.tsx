import { Page } from '@/components'
import { createWallet, dbClient } from '@/db'
import { useIsPending } from '@/hooks'
import { Widgets } from '@/workOS/client'
import { authKitAction } from '@/workOS/server'
import { authkitLoader, signOut } from '@workos-inc/authkit-react-router'
import { UserProfile, UserSecurity, UserSessions } from '@workos-inc/widgets'
import { getString } from '@zodiac/form-data'
import {
  AddressInput,
  Form,
  FormLayout,
  InlineForm,
  Modal,
  PrimaryButton,
  SecondaryButton,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from '@zodiac/ui'
import { useState } from 'react'
import type { Route } from './+types/profile'

export const loader = (args: Route.LoaderArgs) => {
  return authkitLoader(args, { ensureSignedIn: true })
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
          const address = getString(data, 'address')

          await createWallet(dbClient(), user, { label, address })
        }
      }
    },
    { ensureSignedIn: true },
  )

const Profile = ({
  loaderData: { accessToken, sessionId },
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
                <TableBody></TableBody>
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
