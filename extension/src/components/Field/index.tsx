import classNames from 'classnames'
import { ReactNode } from 'react'
import { Box } from '../Box'
import classes from './style.module.css'

type Props = {
  label?: string
  labelFor?: string
  children: ReactNode
  disabled?: boolean
}

export const Field = ({
  label,
  labelFor,
  children,
  disabled = false,
}: Props) => (
  <Box double bg p={3} className={classNames({ [classes.disabled]: disabled })}>
    {label ? (
      <label htmlFor={labelFor}>
        <div className={classes.fieldLabel}>{label}</div>
        {children}
      </label>
    ) : (
      children
    )}
  </Box>
)
