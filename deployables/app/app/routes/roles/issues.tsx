import { Warning } from '@zodiac/ui'

export enum Issue {
  NoActiveAccounts = 'NoActiveAccounts',
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
              <Warning key={issue} title="Accounts missing">
                You have not selected any accounts that this role should be
                active on.
              </Warning>
            )
          }
        }
      })}
    </div>
  )
}
