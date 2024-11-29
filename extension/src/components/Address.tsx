import { Copy } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { GhostButton } from './buttons'
import { infoToast } from './toasts'

export const Address = ({
  children,
  allowCopy = false,
}: PropsWithChildren<{ allowCopy?: boolean }>) => (
  <div className="flex items-center gap-2 overflow-hidden">
    <code className="max-w-full overflow-hidden text-ellipsis text-nowrap rounded-md border border-zinc-300 bg-zinc-100 px-2 py-1 font-mono text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50">
      {children}
    </code>

    {allowCopy && (
      <GhostButton
        iconOnly
        icon={Copy}
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(children, undefined, 2))
          infoToast({
            title: 'Copied!',
            message: 'Address has been copied to clipboard.',
          })
        }}
      >
        Copy address
      </GhostButton>
    )}
  </div>
)
