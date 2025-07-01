import { invariant } from '@epic-web/invariant'
import {
  GhostButton,
  NumberInput,
  PrimaryButton,
  SecondaryButton,
} from '@zodiac/ui'
import { Check, SquarePen, X } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
} from 'react'

interface Props {
  value: `${number}`
  recommendedValue?: `${number}`
  label: string
  description?: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export const InplaceEditAmountField = ({
  value,
  recommendedValue,
  label,
  description,
  onChange,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [editedValue, setEditedValue] = useState(value)
  useEffect(() => {
    setEditedValue(value)
  }, [value])

  const edit = () => {
    setIsEditing(true)
    // Focus the input after a brief delay to ensure the DOM has updated
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const confirm = () => {
    setIsEditing(false)
    onChange({
      target: { value: editedValue },
    } as ChangeEvent<HTMLInputElement>)
  }

  const cancel = () => {
    setIsEditing(false)
    setEditedValue(value) // Restore original value
  }

  const setToRecommended = () => {
    invariant(recommendedValue != null, 'No recommended value')
    setEditedValue(recommendedValue)
    if (!isEditing) {
      onChange({
        target: { value: recommendedValue },
      } as ChangeEvent<HTMLInputElement>)
    }
  }

  const handleKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      confirm()
    } else if (ev.key === 'Escape') {
      ev.preventDefault()
      cancel()
    }
  }

  return (
    <NumberInput
      ref={inputRef}
      readOnly={!isEditing}
      label={label}
      description={description}
      value={editedValue}
      onChange={(ev) => setEditedValue(ev.target.value as `${number}`)}
      onKeyDown={handleKeyDown}
      after={
        <div className="mr-2 flex items-center gap-2">
          {recommendedValue ? (
            <GhostButton size="tiny" onClick={setToRecommended}>
              {compactAmount(recommendedValue)}
            </GhostButton>
          ) : null}

          {isEditing ? (
            <>
              <SecondaryButton iconOnly size="small" icon={X} onClick={cancel}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                iconOnly
                size="small"
                icon={Check}
                onClick={confirm}
              >
                Confirm
              </PrimaryButton>
            </>
          ) : (
            <GhostButton iconOnly size="small" icon={SquarePen} onClick={edit}>
              Edit amount
            </GhostButton>
          )}
        </div>
      }
    />
  )
}

const compactAmount = (amount: `${number}`) => {
  const floatAmount = parseFloat(amount)

  // Use Intl.NumberFormat for compact notation (1.4k, 524k, 1.5M, etc.)
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  }).format(floatAmount)
}
