import classNames from 'classnames'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import classes from './OverlayDrawer.module.css'

function createPortalRoot() {
  const drawerRoot = document.createElement('div')
  drawerRoot.setAttribute('id', 'drawer-root')

  return drawerRoot
}

const useMountTransition = (
  isMounted: boolean,
  unmountDelay: number
): boolean => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isMounted && !isTransitioning) {
      setIsTransitioning(true)
    } else if (!isMounted && isTransitioning) {
      timeoutId = setTimeout(() => setIsTransitioning(false), unmountDelay)
    }
    return () => {
      clearTimeout(timeoutId)
    }
  }, [unmountDelay, isMounted, isTransitioning])

  return isTransitioning
}

interface Props {
  isOpen: boolean
  children: React.ReactNode
  className?: string
  onClose: () => void
  position?: 'left' | 'right'
  removeWhenClosed?: boolean
}

const OverlayDrawer: React.FC<Props> = ({
  isOpen,
  children,
  className,
  onClose,
  position = 'left',
  removeWhenClosed = true,
}) => {
  const bodyRef = useRef(document.querySelector('body'))
  const portalRootRef = useRef(
    document.getElementById('drawer-root') || createPortalRoot()
  )
  const isTransitioning = useMountTransition(isOpen, 300)

  // Append portal root on mount
  useEffect(() => {
    if (!bodyRef.current) return

    bodyRef.current.appendChild(portalRootRef.current)
    const portal = portalRootRef.current
    const bodyEl = bodyRef.current

    return () => {
      // Clean up the portal when drawer component unmounts
      portal.remove()
      // Ensure scroll overflow is removed
      bodyEl.style.overflow = ''
    }
  }, [bodyRef])

  // Prevent page scrolling when the drawer is open
  useEffect(() => {
    const updatePageScroll = () => {
      if (!bodyRef.current) return
      if (isOpen) {
        bodyRef.current.style.overflow = 'hidden'
      } else {
        bodyRef.current.style.overflow = ''
      }
    }

    updatePageScroll()
  }, [isOpen])

  const keyCloser = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', keyCloser, false)

    return () => {
      document.removeEventListener('keydown', keyCloser, false)
    }
  }, [keyCloser])

  if (!isTransitioning && removeWhenClosed && !isOpen) {
    return null
  }

  return createPortal(
    <div
      aria-hidden={isOpen ? 'false' : 'true'}
      className={classNames(classes.drawerContainer, {
        [classes.open]: isOpen,
        [classes.in]: isTransitioning,
      })}
    >
      <div
        className={classNames(classes.drawer, classes[position], className)}
        role="dialog"
      >
        {children}
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={classes.backdrop} onClick={onClose}></div>
    </div>,
    portalRootRef.current
  )
}

export default OverlayDrawer
