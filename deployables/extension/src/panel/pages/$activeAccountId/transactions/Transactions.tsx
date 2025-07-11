import { useTransactions } from '@/transactions'
import { Transaction } from './transaction'

const Transactions = () => {
  const transactions = useTransactions()

  return transactions.map((transaction) => (
    <div id={`t-${transaction.id}`} key={transaction.id}>
      <Transaction transactionId={transaction.id} />
    </div>
  ))
}

export default Transactions
