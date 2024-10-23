import { Slide, ToastContainer } from 'react-toastify'

import classes from './Toast.module.css'

export const ZodiacToastContainer = () => (
  <ToastContainer
    theme="dark"
    transition={Slide}
    bodyClassName={classes.toastBody}
    progressClassName={classes.toastProgress}
    toastClassName={classes.toast}
  />
)

export const toastClasses = classes
