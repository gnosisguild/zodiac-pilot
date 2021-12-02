import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

interface Props {
  direction?: 'row' | 'column'
  gap: 0 | 1 | 2 | 3
}

const Flex: React.FC<Props> = ({ gap, direction = 'row', children }) => (
  <div className={cn(classes.flex, classes[`gap${gap}`], classes[direction])}>
    {children}
  </div>
)

export default Flex
