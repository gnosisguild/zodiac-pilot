import React, { ReactNode, useState } from 'react'
import ReactCarousel from 'react-multi-carousel';

import './react-multi-carousel.css'
import classes from './style.module.css'

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  }
};

export const Carousel: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
return (
  <ReactCarousel
    swipeable={true}
    draggable={true}
    infinite={true}
    containerClass={classes.container}
    itemClass={classes.item}
    responsive={responsive}
    removeArrowOnDeviceType={["desktop", "tablet", "mobile"]}
  >
    {children}
  </ReactCarousel>
)}
