import React, { useEffect, useState } from 'react'

import { Box, Button } from '../../../components'
import Blockie from '../../../components/Blockie'
import { validateAddress } from '../../../utils'

import classes from './style.module.css'

interface Props {
  value: string
  onChange(value: string): void
}

const AvatarInput: React.FC<Props> = ({ value, onChange }) => {
  const [pendingValue, setPendingValue] = useState(value)
  useEffect(() => {
    setPendingValue(value)
  }, [value])

  const checksumAvatarAddress = validateAddress(pendingValue)

  return checksumAvatarAddress ? (
    <div className={classes.avatarContainer}>
      <div className={classes.avatar}>
        <Box rounded>
          <Blockie
            address={checksumAvatarAddress}
            className={classes.avatarBlockie}
          />
        </Box>
        <code className={classes.avatarAddress}>{checksumAvatarAddress}</code>
      </div>
      <Button
        className={classes.removeButton}
        onClick={() => {
          onChange('')
        }}
      >
        Remove
      </Button>
    </div>
  ) : (
    <input
      type="text"
      value={pendingValue}
      placeholder="Paste in Safe address"
      onChange={(ev) => {
        const sanitized = ev.target.value.trim().replace(/^[a-z]{3}:/g, '')
        setPendingValue(sanitized)
        if (validateAddress(sanitized)) {
          onChange(sanitized.toLowerCase())
        }
      }}
    />
  )
}

export default AvatarInput
