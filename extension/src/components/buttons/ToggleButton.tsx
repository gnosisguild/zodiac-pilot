import { ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  expanded: boolean
  onToggle(): void
}

export const ToggleButton = ({ expanded, onToggle }: Props) => (
  <button
    className="rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700"
    onClick={(event) => {
      event.stopPropagation()
      event.preventDefault()

      onToggle()
    }}
    title={expanded ? 'collapse' : 'expand'}
  >
    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
  </button>
)
