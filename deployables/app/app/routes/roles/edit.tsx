import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page, Token } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import { chainName } from '@zodiac/chains'
import {
  dbClient,
  getAccounts,
  getActivatedAccounts,
  getDefaultWallets,
  getRole,
  getRoleActions,
  getRoleMembers,
  getUsers,
  setActiveAccounts,
  setRoleMembers,
  updateRole,
} from '@zodiac/db'
import { RoleActionAsset } from '@zodiac/db/schema'
import { getString, getUUIDList } from '@zodiac/form-data'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import {
  Card,
  DateValue,
  Form,
  FormLayout,
  GhostLinkButton,
  Info,
  MultiSelect,
  NumberValue,
  Popover,
  PrimaryButton,
  SecondaryLinkButton,
  successToast,
  Tag,
} from '@zodiac/ui'
import classNames from 'classnames'
import { ArrowRight, ArrowRightLeft, HandCoins, Pencil } from 'lucide-react'
import { UUID } from 'node:crypto'
import { href, Outlet } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { Route } from './+types/edit'
import { AccountSelect } from './AccountSelect'
import { Intent } from './intents'
import { RoleLabelInput } from './RoleLabelInput'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { roleId, workspaceId },
      context: {
        auth: { tenant },
      },
    }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')
      invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

      const [members, activeAccounts, role, users, accounts, actions] =
        await Promise.all([
          getRoleMembers(dbClient(), { roleId }),
          getActivatedAccounts(dbClient(), { roleId }),
          getRole(dbClient(), roleId),
          getUsers(dbClient(), { tenantId: tenant.id }),
          getAccounts(dbClient(), { workspaceId }),
          getRoleActions(dbClient(), roleId),
        ])

      const activeChains = Array.from(
        new Set(activeAccounts.map((account) => account.chainId)),
      )
      const missingDefaultWallets: Record<UUID, string[]> = {}

      for (const member of members) {
        const defaultWallets = await getDefaultWallets(dbClient(), member.id)

        missingDefaultWallets[member.id] = activeChains.reduce<string[]>(
          (result, chainId) => {
            if (defaultWallets[chainId] == null) {
              return [...result, chainName(chainId)]
            }

            return result
          },
          [],
        )
      }

      return {
        role,
        users,
        accounts,
        activeAccountIds: activeAccounts.map(
          (activeAccount) => activeAccount.id,
        ),
        memberIds: members.map((member) => member.id),
        actions,
        missingDefaultWallets,
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { roleId, workspaceId }, tenant }) {
        invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ params: { roleId }, request }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      const data = await request.formData()

      await dbClient().transaction(async (tx) => {
        const role = await getRole(tx, roleId)

        const label = getString(data, 'label')

        if (label !== role.label) {
          await updateRole(tx, roleId, { label: getString(data, 'label') })
        }

        await setRoleMembers(tx, role, getUUIDList(data, 'members'))
        await setActiveAccounts(tx, role, getUUIDList(data, 'accounts'))
      })

      return null
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { roleId, workspaceId }, tenant }) {
        invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

const EditRole = ({
  loaderData: {
    role,
    users,
    memberIds,
    accounts,
    activeAccountIds,
    actions,
    missingDefaultWallets,
  },
  params: { workspaceId, roleId },
}: Route.ComponentProps) => {
  useAfterSubmit(Intent.Save, () =>
    successToast({
      title: 'Role saved',
      message: 'Your changes to this role have been saved',
    }),
  )

  return (
    <Page>
      <Page.Header>Edit role</Page.Header>
      <Page.Main>
        <Form>
          <Form.Section
            title="Base configuration"
            description="Defines the basics for this role. Who should it be enabled for and what accounts are affected."
          >
            <RoleLabelInput
              required
              label="Label"
              name="label"
              defaultValue={role.label}
              keyValue={role.key}
            />

            <MultiSelect
              label="Members"
              name="members"
              placeholder="Specify who should be affected by this role"
              options={users.map((user) => ({
                label: user.fullName,
                value: user.id,
              }))}
              defaultValue={memberIds}
            >
              {({ data: { label, value } }) => (
                <div className="flex flex-col gap-1">
                  {label}
                  {value in missingDefaultWallets &&
                    missingDefaultWallets[value].length > 0 && (
                      <span
                        role="alert"
                        className="text-xs text-red-600 dark:text-red-400"
                        aria-label="Default wallet missing"
                      >
                        User has no default wallet set for:{' '}
                        <span className="font-semibold dark:font-normal dark:text-red-300">
                          {missingDefaultWallets[value].join(', ')}
                        </span>
                      </span>
                    )}
                </div>
              )}
            </MultiSelect>

            <AccountSelect
              accounts={accounts}
              defaultValue={activeAccountIds}
            />

            <Form.Actions>
              <PrimaryButton
                submit
                intent={Intent.Save}
                busy={useIsPending(Intent.Save)}
              >
                Save
              </PrimaryButton>

              <GhostLinkButton
                to={href('/workspace/:workspaceId/roles', { workspaceId })}
              >
                Cancel
              </GhostLinkButton>
            </Form.Actions>
          </Form.Section>
        </Form>

        <FormLayout>
          <Form.Section title="Actions">
            {actions.map((action) => (
              <Card
                key={action.id}
                titleId={action.id}
                title={
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Popover
                        popover={
                          <span className="text-xs uppercase">
                            {action.type}
                          </span>
                        }
                      >
                        <Tag head={<ArrowRightLeft />} />
                      </Popover>

                      <h2>
                        <span id={action.id} className="font-semibold">
                          {action.label}
                        </span>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Created by{' '}
                          <span className="text-zinc-600 dark:text-zinc-300">
                            {action.createdBy.fullName}
                          </span>{' '}
                          on{' '}
                          <span className="text-zinc-600 dark:text-zinc-300">
                            <DateValue>{action.createdAt}</DateValue>
                          </span>
                        </div>
                      </h2>
                    </div>

                    <GhostLinkButton
                      iconOnly
                      replace
                      size="small"
                      icon={Pencil}
                      to={href(
                        '/workspace/:workspaceId/roles/:roleId/action/:actionId',
                        { workspaceId, roleId, actionId: action.id },
                      )}
                    >
                      Edit action
                    </GhostLinkButton>
                  </div>
                }
              >
                {action.assets.length === 0 && (
                  <Info>
                    No assets have been configured for this swap
                    <Info.Actions>
                      <SecondaryLinkButton
                        size="small"
                        to={href(
                          '/workspace/:workspaceId/roles/:roleId/action/:actionId',
                          { workspaceId, roleId, actionId: action.id },
                        )}
                      >
                        Configure swap
                      </SecondaryLinkButton>
                    </Info.Actions>
                  </Info>
                )}

                {action.assets.length > 0 && (
                  <div className="grid grid-cols-9 items-center gap-4">
                    <div className="col-span-4 flex flex-col divide-y divide-zinc-300 rounded bg-zinc-100 dark:divide-zinc-700 dark:bg-zinc-800">
                      {action.assets
                        .filter((asset) => asset.allowSell)
                        .map((asset) => (
                          <Asset key={asset.id} asset={asset} context="sell" />
                        ))}
                    </div>

                    <div className="flex justify-center">
                      <ArrowRight className="size-4" />
                    </div>

                    <div className="col-span-4 flex flex-col divide-y divide-zinc-300 rounded bg-zinc-100 dark:divide-zinc-700 dark:bg-zinc-800">
                      {action.assets
                        .filter((asset) => asset.allowBuy)
                        .map((asset) => (
                          <Asset key={asset.id} asset={asset} context="buy" />
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {actions.length === 0 && (
              <Info title="No actions">
                You have not added any actions to this role, yet.
              </Info>
            )}

            <FormLayout.Actions>
              <SecondaryLinkButton
                to={href('/workspace/:workspaceId/roles/:roleId/add-action', {
                  workspaceId,
                  roleId,
                })}
              >
                Add new action
              </SecondaryLinkButton>
            </FormLayout.Actions>
          </Form.Section>
        </FormLayout>
      </Page.Main>

      <Outlet />
    </Page>
  )
}

export default EditRole

const Asset = ({
  asset,
  context,
}: {
  asset: RoleActionAsset
  context: 'sell' | 'buy'
}) => (
  <div className="group flex items-center justify-between py-2 pl-4 pr-2">
    <div className="flex flex-col gap-1">
      <Token contractAddress={prefixAddress(asset.chainId, asset.address)}>
        {asset.symbol}

        {asset.allowance && asset.interval && (
          <div className="flex gap-1 text-xs opacity-75">
            {context}
            <NumberValue>{asset.allowance}</NumberValue>
            {asset.interval}
          </div>
        )}
      </Token>
    </div>

    <div
      className={classNames(
        'transition-opacity',
        asset.allowance == null && 'opacity-0 group-hover:opacity-100',
      )}
    >
      <GhostLinkButton
        iconOnly
        icon={HandCoins}
        size="tiny"
        to={href(
          '/workspace/:workspaceId/roles/:roleId/action/:actionId/asset/:assetId',
          {
            workspaceId: asset.workspaceId,
            roleId: asset.roleId,
            actionId: asset.roleActionId,
            assetId: asset.id,
          },
        )}
      >
        Edit allowance
      </GhostLinkButton>
    </div>
  </div>
)
