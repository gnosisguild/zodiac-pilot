import { TextInput } from '@zodiac/ui'

interface Props {
  data: string
}

export const RawTransaction = ({ data }: Props) => (
  <TextInput readOnly defaultValue={data || ''} label="Data" />
)
