import { BaseTransaction } from './BaseTransaction'

interface Props {
  data: string
}

export const RawTransaction = ({ data }: Props) => (
  <BaseTransaction value={data || ''}>
    <span>Data</span>
  </BaseTransaction>
)
