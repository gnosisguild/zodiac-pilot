import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { Widgets } from '@/workOS/client'
import { signOut } from '@workos-inc/authkit-react-router'
import { UserProfile, UserSecurity, UserSessions } from '@workos-inc/widgets'
import { dbClient, getWallets, updateWalletLabel } from '@zodiac/db'
import type { Wallet } from '@zodiac/db/schema'
import { getString, getUUID } from '@zodiac/form-data'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import {
  Address,
  FormLayout,
  GhostButton,
  GhostLinkButton,
  InlineForm,
  SecondaryButton,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from '@zodiac/ui'
import { Check, Edit, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { href, Outlet } from 'react-router'
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
    async ({ request }) => {
      const data = await request.formData()

      switch (getString(data, 'intent')) {
        case Intent.SignOut: {
          return await signOut(request)
        }

        case Intent.RenameWallet: {
          const walletId = getUUID(data, 'walletId')

          await updateWalletLabel(
            dbClient(),
            walletId,
            getString(data, 'label'),
          )

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
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
                    <Wallet key={wallet.id} wallet={wallet} />
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <SecondaryLinkButton to={href('/profile/add-wallet')}>
                  Add Wallet
                </SecondaryLinkButton>
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

      <Outlet />
    </Page>
  )
}

const Wallet = ({ wallet }: { wallet: Wallet }) => {
  const [editing, setEditing] = useState(false)

  const formId = useId()

  const busy = useIsPending(
    Intent.RenameWallet,
    (data) => data.get('walletId') === wallet.id,
  )

  useAfterSubmit(
    Intent.RenameWallet,
    () => setEditing(false),
    (data) => data.get('walletId') === wallet.id,
  )

  return (
    <TableRow>
      <TableCell>
        {editing ? (
          <TextInput
            hideLabel
            form={formId}
            defaultValue={wallet.label}
            label="Label"
            name="label"
          />
        ) : (
          wallet.label
        )}
      </TableCell>
      <TableCell>
        <Address>{wallet.address}</Address>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {editing ? (
            <InlineForm id={formId} context={{ walletId: wallet.id }}>
              <GhostButton
                submit
                iconOnly
                icon={Check}
                size="tiny"
                busy={busy}
                intent={Intent.RenameWallet}
              >
                Save
              </GhostButton>
            </InlineForm>
          ) : (
            <GhostButton
              iconOnly
              icon={Edit}
              size="tiny"
              onClick={() => setEditing(true)}
            >
              Edit wallet
            </GhostButton>
          )}

          <DeleteWallet walletId={wallet.id} />
        </div>
      </TableCell>
    </TableRow>
  )
}

const DeleteWallet = ({ walletId }: { walletId: string }) => {
  return (
    <GhostLinkButton
      iconOnly
      to={href('/profile/delete-wallet/:walletId', { walletId })}
      size="small"
      icon={Trash2}
      style="critical"
    >
      Remove wallet
    </GhostLinkButton>
  )
}

export default Profile

enum Intent {
  SignOut = 'SignOut',
  RenameWallet = 'RenameWallet',
}
