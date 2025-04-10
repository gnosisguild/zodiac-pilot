import { authorizedAction, authorizedLoader } from '@/auth'
import { Page } from '@/components'
import {
  createWallet,
  dbClient,
  deleteWallet,
  findWalletByAddress,
  getWallet,
  getWallets,
} from '@/db'
import { useAfterSubmit, useIsPending } from '@/hooks'
import { Widgets } from '@/workOS/client'
import { signOut } from '@workos-inc/authkit-react-router'
import { UserProfile, UserSecurity, UserSessions } from '@workos-inc/widgets'
import { getHexString, getString } from '@zodiac/form-data'
import {
  Address,
  AddressInput,
  Error,
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
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useActionData } from 'react-router'
import type { Route } from './+types/profile'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
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

export const action = async (args: Route.ActionArgs) =>
  authorizedAction(
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

          const existingWallet = await findWalletByAddress(
            dbClient(),
            user,
            address,
          )

          if (existingWallet != null) {
            return {
              error: `A wallet with this address already exists under the name "${existingWallet.label}".`,
            }
          }

          await createWallet(dbClient(), user, { label, address })

          return null
        }

        case Intent.DeleteWallet: {
          const walletId = getString(data, 'walletId')

          await deleteWallet(dbClient(), user, walletId)

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, request }) {
        const data = await request.formData()

        switch (getString(data, 'intent')) {
          case Intent.DeleteWallet: {
            const wallet = await getWallet(
              dbClient(),
              getString(data, 'walletId'),
            )

            return wallet.belongsToId === user.id
          }

          default: {
            return true
          }
        }
      },
    },
  )

const Profile = ({
  loaderData: { accessToken, sessionId, wallets },
}: Route.ComponentProps) => {
  const signingOut = useIsPending(Intent.SignOut)

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
                    <TableHeader className="relative w-0">
                      <span className="sr-only">Actions</span>
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wallets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <div className="text-center italic">
                          You haven't created any wallets, yet.
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {wallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>{wallet.label}</TableCell>
                      <TableCell>
                        <Address>{wallet.address}</Address>
                      </TableCell>
                      <TableCell>
                        <DeleteWallet walletId={wallet.id} />
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

  useAfterSubmit<typeof action>(Intent.AddWallet, (actionData) => {
    if (actionData == null) {
      setOpen(false)
    }
  })

  const actionData = useActionData<typeof action>()

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
          {actionData != null && (
            <Error title="Wallet already exists">{actionData.error}</Error>
          )}

          <TextInput required label="Label" name="label" placeholder="Label" />
          <AddressInput required label="Address" name="address" />

          <Modal.Actions>
            <PrimaryButton submit busy={useIsPending(Intent.AddWallet)}>
              Add
            </PrimaryButton>
            <GhostButton onClick={() => setOpen(false)}>Cancel</GhostButton>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}

const DeleteWallet = ({ walletId }: { walletId: string }) => {
  const pending = useIsPending(
    Intent.DeleteWallet,
    (data) => data.get('walletId') === walletId,
  )

  return (
    <InlineForm intent={Intent.DeleteWallet} context={{ walletId }}>
      <GhostButton submit iconOnly busy={pending} size="small" icon={Trash2}>
        Remove wallet
      </GhostButton>
    </InlineForm>
  )
}

export default Profile

enum Intent {
  SignOut = 'SignOut',
  AddWallet = 'AddWallet',
  DeleteWallet = 'DeleteWallet',
}
