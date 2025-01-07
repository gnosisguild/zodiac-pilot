import { Copy } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { type BaseButtonProps, GhostButton } from './buttons'
import { infoToast } from './toasts'

type CopyToClipboardProps = PropsWithChildren<{
  data: unknown
}> &
  Pick<BaseButtonProps, 'size' | 'iconOnly' | 'disabled'>

export const CopyToClipboard = ({ data, ...props }: CopyToClipboardProps) => (
  <GhostButton
    {...props}
    icon={Copy}
    onClick={() => {
      navigator.clipboard.writeText(
        JSON.stringify(
          data,
          (_, value) => {
            if (typeof value === 'bigint') {
              return value.toString()
            }

            return value
          },
          2,
        ),
      )

      infoToast({
        title: 'Copied!',
        message: 'Data has been copied to the clipboard.',
      })
    }}
  />
)
