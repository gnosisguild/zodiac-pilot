import classNames from 'classnames'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type CollapsibleProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export const Collapsible = ({
  title,
  children,
  defaultOpen = false,
}: CollapsibleProps) => {
  const [open, setOpen] = useState(defaultOpen)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [children, open])

  const toggleOpen = () => setOpen((prev) => !prev)

  return (
    <div className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <span className="text-sm font-semibold dark:text-zinc-50">{title}</span>
        <ChevronDown
          size={16}
          className={classNames(
            'text-zinc-500 transition-transform duration-300',
            {
              'rotate-180': open,
            },
          )}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? `${contentHeight}px` : '0px' }}
      >
        <div className="py-4">{children}</div>
      </div>
    </div>
  )
}
