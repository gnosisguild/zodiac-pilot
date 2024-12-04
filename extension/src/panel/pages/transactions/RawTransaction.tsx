import { TextInput } from '@/components'

interface Props {
  data: string
}

export const RawTransaction = ({ data }: Props) => (
  <TextInput readOnly defaultValue={data || ''} label="Data" />
)
