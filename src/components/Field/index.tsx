import React, { ReactNode } from 'react'

import Box from '../Box'

import classes from './style.module.css'

const Field: React.FC<{
  label?: string
  labelFor?: string
  children: ReactNode
}> = ({ label, labelFor, children }) => (
  <Box double bg p={3}>
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

export default Field
