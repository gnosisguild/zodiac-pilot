import { findActiveAccount, getAccounts } from '@/accounts'
import { redirect } from 'react-router'

export const loader = async () => {
  const activeAccount = await findActiveAccount()

  if (activeAccount != null) {
    return redirect(`/${activeAccount.id}`)
  }

  const [account] = await getAccounts()

  if (account != null) {
    return redirect(`/${account.id}`)
  }

  return redirect('/no-accounts')
}
