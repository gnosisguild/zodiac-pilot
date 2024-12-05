import { PropsWithChildren } from 'react'
import { CopyToClipboard } from './CopyToClipboard'

export const Address = ({
  children,
  allowCopy = false,
}: PropsWithChildren<{ allowCopy?: boolean }>) => (
  <div className="flex items-center gap-2 overflow-hidden">
    <code className="max-w-full overflow-hidden text-ellipsis text-nowrap rounded-md border border-zinc-300 bg-zinc-100 px-2 py-1 font-mono text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50">
      {children}
    </code>

    {allowCopy && (
      <CopyToClipboard iconOnly data={children}>
        Copy address
      </CopyToClipboard>
    )}
  </div>
)
