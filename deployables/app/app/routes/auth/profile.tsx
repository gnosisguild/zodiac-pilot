import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { Chain } from '@/routes-ui'
import { Widgets } from '@/workOS/client'
import { useWorkspaceId } from '@/workspaces'
import { signOut } from '@workos-inc/authkit-react-router'
import { UserProfile, UserSecurity, UserSessions } from '@workos-inc/widgets'
import { chainName, getEnabledChains, verifyChainId } from '@zodiac/chains'
import {
  dbClient,
  getDefaultWallets,
  getWallets,
  removeDefaultWallet,
  setDefaultWallet,
  updateWalletLabel,
} from '@zodiac/db'
import type { Wallet } from '@zodiac/db/schema'
import { getInt, getOptionalUUID, getString, getUUID } from '@zodiac/form-data'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import {
  FormLayout,
  GhostButton,
  GhostLinkButton,
  InlineForm,
  SecondaryButton,
  SecondaryLinkButton,
  Select,
  successToast,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import { Check, Edit, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/profile'
import { Intent } from './intents'

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
        defaultWallets: await getDefaultWallets(dbClient(), user.id),
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

        case Intent.RenameWallet: {
          const walletId = getUUID(data, 'walletId')

          await updateWalletLabel(
            dbClient(),
            walletId,
            getString(data, 'label'),
          )

          return null
        }

        case Intent.UpdateDefaultWallet: {
          const walletId = getOptionalUUID(data, 'walletId')
          const chainId = verifyChainId(getInt(data, 'chainId'))

          if (walletId == null) {
            await removeDefaultWallet(dbClient(), user, chainId)
          } else {
            await setDefaultWallet(dbClient(), user, { walletId, chainId })
          }

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
    },
  )

const Profile = ({
  loaderData: { accessToken, sessionId, wallets, defaultWallets },
  params: { workspaceId },
}: Route.ComponentProps) => {
  const signingOut = useIsPending(Intent.SignOut)
  const updatingDefaultWallet = useIsPending(Intent.UpdateDefaultWallet)

  useAfterSubmit(Intent.UpdateDefaultWallet, () =>
    successToast({
      title: 'Success',
      message: 'Default wallet has been updated',
    }),
  )

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
                  <TableRow withActions>
                    <TableHeader>Label</TableHeader>
                    <TableHeader>Address</TableHeader>
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
                <SecondaryLinkButton
                  to={href('/workspace/:workspaceId/profile/add-wallet', {
                    workspaceId,
                  })}
                >
                  Add Wallet
                </SecondaryLinkButton>
              </div>
            </FormLayout.Section>

            <FormLayout.Section
              title="Default wallets"
              description="Define a default wallet for each chain. It will be used to grant you access when new roles are being created inside this organization."
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Chain</TableHeader>
                    <TableHeader>Default wallet</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getEnabledChains().map((chainId) => (
                    <TableRow key={`${chainId}`}>
                      <TableCell>
                        <Chain chainId={chainId} />
                      </TableCell>
                      <TableCell>
                        <InlineForm
                          intent={Intent.UpdateDefaultWallet}
                          context={{ chainId }}
                        >
                          {({ submit }) => (
                            <Select
                              hideLabel
                              isClearable
                              clearLabel={`Remove default wallet for ${chainName(chainId)}`}
                              onChange={submit}
                              name="walletId"
                              isDisabled={updatingDefaultWallet}
                              defaultValue={
                                defaultWallets[chainId] == null
                                  ? undefined
                                  : {
                                      value: defaultWallets[chainId].id,
                                      label: defaultWallets[chainId].label,
                                    }
                              }
                              placeholder={`Default wallet for ${chainName(chainId)}`}
                              label={`Default wallet for ${chainName(chainId)}`}
                              options={wallets.map((wallet) => ({
                                label: wallet.label,
                                value: wallet.id,
                              }))}
                            />
                          )}
                        </InlineForm>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                size="small"
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
              size="small"
              onClick={() => setEditing(true)}
            >
              Edit wallet
            </GhostButton>
          )}

          <GhostLinkButton
            iconOnly
            to={href(
              '/workspace/:workspaceId/profile/delete-wallet/:walletId',
              {
                walletId: wallet.id,
                workspaceId: useWorkspaceId(),
              },
            )}
            size="small"
            icon={Trash2}
            style="critical"
          >
            Remove wallet
          </GhostLinkButton>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default Profile
