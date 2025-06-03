import { CopyToClipboard } from '../CopyToClipboard'

export const Kbd = ({ children }: { children: string }) => (
  <div className="flex items-center gap-2">
    <span className="rounded bg-white/10 px-2 py-1 font-mono text-xs tabular-nums">
      {children}
    </span>
    <CopyToClipboard iconOnly data={children} size="tiny" />
  </div>
)
