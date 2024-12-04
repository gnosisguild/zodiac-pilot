import { ChevronDown, ChevronRight } from 'lucide-react'
import { GhostButton } from './GhostButton'

interface Props {
  expanded: boolean
  onToggle(): void
}

export const ToggleButton = ({ expanded, onToggle }: Props) => (
  <GhostButton
    iconOnly
    icon={expanded ? ChevronDown : ChevronRight}
    size="small"
    onClick={(event) => {
      event.stopPropagation()
      event.preventDefault()

      onToggle()
    }}
  >
    {expanded ? 'collapse' : 'expand'}
  </GhostButton>
)
