import React from 'react'
import cn from 'classnames'
import pilotIcon from './pilot-icon.svg'
import targetIcon from './target-safe-icon.svg'
import PUBLIC_PATH from '../../publicPath'
import classes from './style.module.css'

interface RouteBadgeIcon {
  badgeType: 'pilot' | 'target'
  label?: string
}

const RouteBadgeIcon: React.FC<RouteBadgeIcon> = ({ badgeType, label }) => {
  const PILOT_ICON = PUBLIC_PATH + pilotIcon
  const TARGET_ICON = PUBLIC_PATH + targetIcon

  const icon = badgeType === 'pilot' ? PILOT_ICON : TARGET_ICON

  return (
    <div className={cn([classes.routeContainer])}>
      <div className={cn([classes.routeIconContainer])}>
        <img src={icon} alt={`${badgeType} Icon`} />
      </div>
      {label && <p style={{ textAlign: 'start' }}>{label}</p>}
    </div>
  )
}

export default RouteBadgeIcon
