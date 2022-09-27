import React from 'react'
import { Slide, ToastContainer } from 'react-toastify'

import classes from './Toast.module.css'

const ZodiacToastContainer: React.FC = () => {
  return (
    <ToastContainer
      theme="dark"
      transition={Slide}
      bodyClassName={classes.toastBody}
      progressClassName={classes.toastProgress}
      toastClassName={classes.toast}
    />
  )
}

export default ZodiacToastContainer
