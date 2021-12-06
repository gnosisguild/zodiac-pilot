import React, { useState } from 'react'

import { AppPicker, Box } from '../components'

import searchIcon from './search-icon.svg'
import classes from './style.module.css'

interface Props {
  onPick: (a: string) => void
}

const AppSearch: React.FC<Props> = ({ onPick }) => {
  const [query, setQuery] = useState('')
  return (
    <Box>
      <Box bg double>
        <i className={classes.inputIcon}>
          <img src={searchIcon} alt="search-icon" />
        </i>
        <input
          type="text"
          value={query}
          placeholder="Filter app list"
          onChange={(ev) => {
            setQuery(ev.target.value)
          }}
          className={classes.pickerInput}
        />
      </Box>
      <AppPicker onPick={onPick} query={query} />
    </Box>
  )
}

export default AppSearch
