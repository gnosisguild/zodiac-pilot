import { Copy } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { BaseButtonProps, GhostButton } from './buttons'
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
      navigator.clipboard.writeText(JSON.stringify(data, undefined, 2))

      infoToast({
        title: 'Copied!',
        message: 'Data has been copied to the clipboard.',
      })
    }}
  />
)
