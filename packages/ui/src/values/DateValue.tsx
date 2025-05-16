type DateValueProps = {
  children: Date
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export const DateValue = ({ children }: DateValueProps) => {
  return (
    <span className="text-sm slashed-zero tabular-nums">
      {dateFormatter.format(children)}
    </span>
  )
}
