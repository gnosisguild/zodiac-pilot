import { getRoleActionKey } from '@zodiac/modules'
import { Kbd, TextInput } from '@zodiac/ui'
import { ComponentProps, useState } from 'react'

export const ActionLabelInput = ({
  defaultValue = '',
  keyValue,
  ...props
}: ComponentProps<typeof TextInput> & { keyValue?: string }) => {
  const [value, setValue] = useState<string>(defaultValue)

  return (
    <div className="flex flex-col gap-2">
      <TextInput
        {...props}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <div className="flex items-center gap-2">
        <span className="text-xs">Generated key</span>
        <Kbd>
          {keyValue || getRoleActionKey(value) || '<key will show up here>'}
        </Kbd>
      </div>
    </div>
  )
}
