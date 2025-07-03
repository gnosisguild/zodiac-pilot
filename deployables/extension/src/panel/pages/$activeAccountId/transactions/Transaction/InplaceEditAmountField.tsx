import { invariant } from '@epic-web/invariant'
import {
  GhostButton,
  NumberInput,
  Popover,
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
  recommendedDescription?: string
  label: string
  description?: string
  onChange: ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
}

export const InplaceEditAmountField = ({
  value,
  recommendedValue,
  recommendedDescription,
  label,
  description,
  onChange,
  disabled,
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
    if (value !== editedValue) {
      onChange({
        target: { value: editedValue },
      } as ChangeEvent<HTMLInputElement>)
    }
  }

  const cancel = () => {
    setIsEditing(false)
    setEditedValue(value) // Restore original value
  }

  const setToRecommended = () => {
    invariant(recommendedValue != null, 'No recommended value')
    setEditedValue(recommendedValue)
    if (!isEditing && value !== recommendedValue) {
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

  const recommendedButton = recommendedValue ? (
    <GhostButton disabled={disabled} size="tiny" onClick={setToRecommended}>
      {compactAmount(recommendedValue)}
    </GhostButton>
  ) : null

  return (
    <NumberInput
      ref={inputRef}
      readOnly={!isEditing || disabled}
      label={label}
      description={description}
      value={editedValue}
      onChange={(ev) => setEditedValue(ev.target.value as `${number}`)}
      onKeyDown={handleKeyDown}
      after={
        <div className="mr-2 flex items-center gap-2">
          {recommendedDescription && recommendedButton ? (
            <Popover
              position="top"
              popover={<div className="text-xs">{recommendedDescription}</div>}
            >
              {recommendedButton}
            </Popover>
          ) : (
            recommendedButton
          )}

          {isEditing ? (
            <>
              <SecondaryButton
                disabled={disabled}
                iconOnly
                size="small"
                icon={X}
                onClick={cancel}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                disabled={disabled}
                iconOnly
                size="small"
                icon={Check}
                onClick={confirm}
              >
                Confirm
              </PrimaryButton>
            </>
          ) : (
            <GhostButton
              disabled={disabled}
              iconOnly
              size="small"
              icon={SquarePen}
              onClick={edit}
            >
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
