import React from 'react'
import { IconType } from 'react-icons/lib'

export const ConnectedIcon: IconType = ({ size, color, title, role }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role={role}
  >
    {title && <title>{title}</title>}
    <path
      d="M9.15758 9.84047L7.71617 11.2819C6.34934 12.6487 6.34934 14.8648 7.71617 16.2316V16.2316M9.15758 9.84047L11.6053 7.39279C12.9721 6.02595 15.1882 6.02595 16.555 7.39279V7.39279M9.15758 9.84047L14.1073 14.7902M14.1073 14.7902L16.555 12.3425C17.9218 10.9757 17.9218 8.75962 16.555 7.39279V7.39279M14.1073 14.7902L12.6659 16.2316C11.2991 17.5985 9.08301 17.5985 7.71617 16.2316V16.2316M7.71617 16.2316L-0.00266543 23.9485M16.555 7.39279L23.9484 -0.000610872"
      stroke={color}
    />
  </svg>
)

export const DisconnectedIcon: IconType = ({ size, color, title, role }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role={role}
  >
    {title && <title>{title}</title>}
    <path
      d="M6.30204 17.6458V17.6458C7.66887 19.0126 9.88495 19.0126 11.2518 17.6458L12.6932 16.2043L7.74345 11.2546L6.30204 12.696C4.9352 14.0628 4.9352 16.2789 6.30204 17.6458V17.6458ZM6.30204 17.6458L-0.00266543 23.9485M17.9693 5.9785V5.9785C16.6025 4.61166 14.3864 4.61166 13.0196 5.97849L10.5719 8.42617L15.5216 13.3759L17.9693 10.9282C19.3361 9.56141 19.3361 7.34533 17.9693 5.9785V5.9785ZM17.9693 5.9785L23.9987 -0.0509443M9.13046 12.696L10.5447 11.2818M11.2518 14.8173L12.666 13.4031"
      stroke={color}
    />
  </svg>
)
