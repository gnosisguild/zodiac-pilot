import { Ellipsis } from 'lucide-react'
import { type PropsWithChildren } from 'react'
import { GhostButton, type BaseButtonProps } from './buttons'
import { Stick } from './overlays/Stick'

type MeatballMenuProps = Pick<BaseButtonProps, 'size'> &
  PropsWithChildren<{
    label: string
    open: boolean
    onRequestShow: () => void
    onRequestHide: () => void
  }>

export const MeatballMenu = ({
  label,
  open,
  size,
  children,
  onRequestHide,
  onRequestShow,
}: MeatballMenuProps) => {
  return (
    <Stick
      position="bottom right"
      onClickOutside={onRequestHide}
      node={
        open && (
          <div className="flex flex-col gap-1 rounded-md border p-1 shadow-md backdrop-blur dark:border-zinc-200/10 dark:bg-zinc-800/80">
            {children}
          </div>
        )
      }
    >
      <GhostButton
        iconOnly
        size={size}
        icon={Ellipsis}
        onClick={() => (open ? onRequestHide() : onRequestShow())}
      >
        {label}
      </GhostButton>
    </Stick>
  )
}
