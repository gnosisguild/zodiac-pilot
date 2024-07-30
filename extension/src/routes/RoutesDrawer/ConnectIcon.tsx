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

export const RouteIcon: IconType = ({ size, color, title, role }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    role={role}
    fill="none"
  >
    {title && <title>{title}</title>}
    <g clipPath="url(#clip0_169_6271)">
      <path
        opacity="0.2"
        d="M12.5 14.5C13.3284 14.5 14 13.8284 14 13C14 12.1716 13.3284 11.5 12.5 11.5C11.6716 11.5 11 12.1716 11 13C11 13.8284 11.6716 14.5 12.5 14.5Z"
        fill={color}
      />
      <path
        d="M12.5 14.5C13.3284 14.5 14 13.8284 14 13C14 12.1716 13.3284 11.5 12.5 11.5C11.6716 11.5 11 12.1716 11 13C11 13.8284 11.6716 14.5 12.5 14.5Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 4H10.5C11.0304 4 11.5391 4.21071 11.9142 4.58579C12.2893 4.96086 12.5 5.46957 12.5 6C12.5 6.53043 12.2893 7.03914 11.9142 7.41421C11.5391 7.78929 11.0304 8 10.5 8H4.5C3.83696 8 3.20107 8.26339 2.73223 8.73223C2.26339 9.20107 2 9.83696 2 10.5C2 11.163 2.26339 11.7989 2.73223 12.2678C3.20107 12.7366 3.83696 13 4.5 13H11"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_169_6271">
        <rect
          width="16"
          height="16"
          fill="white"
          transform="translate(0 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
)

export const EditIcon: IconType = ({ size, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g clipPath="url(#clip0_248_10327)">
      <path
        d="M8.68969 20.2501H4.5C4.30109 20.2501 4.11032 20.1711 3.96967 20.0305C3.82902 19.8898 3.75 19.699 3.75 19.5001V15.3104C3.75009 15.1118 3.82899 14.9213 3.96938 14.7807L15.5306 3.2195C15.6713 3.07895 15.862 3 16.0608 3C16.2596 3 16.4503 3.07895 16.5909 3.2195L20.7806 7.40637C20.9212 7.54701 21.0001 7.7377 21.0001 7.93653C21.0001 8.13535 20.9212 8.32605 20.7806 8.46668L9.21937 20.0307C9.07883 20.1711 8.88834 20.25 8.68969 20.2501Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 6L18 11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_248_10327">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
