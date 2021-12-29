import React from 'react'

import classes from './style.module.css'

interface Props {
  expanded: boolean
  onToggle(): void
}

const ToggleButton: React.FC<Props> = ({ expanded, onToggle }) => (
  <button
    className={classes.toggleButton}
    onClick={onToggle}
    title={expanded ? 'collapse' : 'expand'}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 33 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={!expanded ? { transform: 'rotate(180deg)' } : {}}
    >
      <g>
        <path
          d="M24.0858 22.1271L13.9142 32.2987C12.6543 33.5586 10.5 32.6663 10.5 30.8845L10.5 10.5413C10.5 8.75951 12.6543 7.86718 13.9142 9.12711L24.0858 19.2987C24.8668 20.0797 24.8668 21.3461 24.0858 22.1271Z"
          fill="#D9D4AD"
          fillOpacity="0.3"
        />
        <path
          d="M23.7322 21.7736L13.5607 31.9451C12.6157 32.8901 11 32.2208 11 30.8845L11 10.5413C11 9.20496 12.6157 8.53571 13.5607 9.48066L23.7322 19.6522C24.318 20.238 24.318 21.1878 23.7322 21.7736Z"
          stroke="#D9D4AD"
          strokeOpacity="0.3"
        />
      </g>
    </svg>
  </button>
)

export default ToggleButton
