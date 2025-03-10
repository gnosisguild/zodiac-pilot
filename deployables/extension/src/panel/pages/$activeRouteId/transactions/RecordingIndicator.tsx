import { usePilotIsReady } from '@/port-handling'
import { useId } from 'react'
import { RecordingIcon } from './RecordingIcon'

export const RecordingIndicator = () => {
  const pilotIsReady = usePilotIsReady()
  const id = useId()

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2">
        <RecordingIcon active={pilotIsReady} />

        <h4 aria-describedby={id}>
          {pilotIsReady
            ? 'Recording transactions'
            : 'Not recording transactions'}
        </h4>
      </div>

      {!pilotIsReady && (
        <span id={id} className="ml-6 text-xs opacity-75">
          Recording starts when Pilot connects
        </span>
      )}
    </div>
  )
}
