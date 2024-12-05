import { Copy } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { BaseButtonProps, GhostButton } from './buttons'
import { infoToast } from './toasts'

type CopyToClipboardProps = PropsWithChildren<{
  data: unknown
}> &
  Pick<BaseButtonProps, 'size' | 'iconOnly'>

export const CopyToClipboard = ({
  data,
  children,
  iconOnly,
  size,
}: CopyToClipboardProps) => (
  <GhostButton
    iconOnly={iconOnly}
    size={size}
    icon={Copy}
    onClick={() => {
      navigator.clipboard.writeText(JSON.stringify(data, undefined, 2))

      infoToast({
        title: 'Copied!',
        message: 'Data has been copied to the clipboard.',
      })
    }}
  >
    {children}
  </GhostButton>
)
