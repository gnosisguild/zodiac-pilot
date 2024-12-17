import classNames from 'classnames'

type RecordingIconProps = {
  active: boolean
}

export const RecordingIcon = ({ active }: RecordingIconProps) => (
  <div className="relative flex size-4 items-center justify-center">
    <div
      className={classNames(
        'absolute size-4 rounded-full transition-all',
        active && 'animate-ping bg-red-400/50 motion-reduce:animate-none',
      )}
    />
    <div
      className={classNames(
        'size-3 rounded-full transition-all',
        active && 'bg-red-500',
        !active && 'bg-gray-500',
      )}
    />
  </div>
)
