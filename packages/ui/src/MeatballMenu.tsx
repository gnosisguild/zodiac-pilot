import { Ellipsis } from 'lucide-react'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { GhostButton, type BaseButtonProps } from './buttons'
import { Stick } from './overlays/Stick'

type MeatballMenuProps = Pick<BaseButtonProps, 'size'> &
  PropsWithChildren<{
    label: string
    onShow?: () => void
    onHide?: () => void
  }>

export const MeatballMenu = ({
  label,
  size,
  children,
  onShow,
  onHide,
}: MeatballMenuProps) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      if (onShow != null) {
        onShow()
      }
    } else {
      if (onHide != null) {
        onHide()
      }
    }
  }, [onHide, onShow, open])

  return (
    <Stick
      position="bottom right"
      onClickOutside={() => setOpen(false)}
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
        onClick={() => setOpen(!open)}
      >
        {label}
      </GhostButton>
    </Stick>
  )
}
