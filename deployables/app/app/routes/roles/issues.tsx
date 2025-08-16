import { Error, Warning } from '@zodiac/ui'

export enum Issue {
  NoActiveAccounts = 'NoActiveAccounts',
  NoActiveMembers = 'NoActiveMembers',
  MissingDefaultWallet = 'MissingDefaultWallet',
}

export const Issues = ({ issues }: { issues: Issue[] }) => {
  if (issues.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {issues.map((issue) => {
        switch (issue) {
          case Issue.NoActiveAccounts: {
            return (
              <Error key={issue} title="Accounts missing">
                You have not selected any accounts that this role should be
                active on.
              </Error>
            )
          }
          case Issue.NoActiveMembers: {
            return (
              <Warning key={issue} title="Members missing">
                You have not selected any members that should be part of this
                role.
              </Warning>
            )
          }
          case Issue.MissingDefaultWallet: {
            return (
              <Warning key={issue} title="Members missing">
                Not all members have selected a default safes for the chains
                this role will be deployed to. This means the role will not be
                active for them on these chains.
              </Warning>
            )
          }
        }
      })}
    </div>
  )
}
