import React, { useState } from 'react'

import { AppPicker, Box } from '../'
import PUBLIC_PATH from '../../publicPath'

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
          <img src={PUBLIC_PATH + searchIcon} alt="search-icon" />
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
      <div className={classes.appPicker}>
        <AppPicker onPick={onPick} query={query} />
      </div>
    </Box>
  )
}

export default AppSearch
