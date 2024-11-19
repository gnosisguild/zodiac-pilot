import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  color?: string
}>

export const ConnectedIcon = ({ color = 'green' }: Props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="status"
  >
    <path
      d="M9.15758 9.84047L7.71617 11.2819C6.34934 12.6487 6.34934 14.8648 7.71617 16.2316V16.2316M9.15758 9.84047L11.6053 7.39279C12.9721 6.02595 15.1882 6.02595 16.555 7.39279V7.39279M9.15758 9.84047L14.1073 14.7902M14.1073 14.7902L16.555 12.3425C17.9218 10.9757 17.9218 8.75962 16.555 7.39279V7.39279M14.1073 14.7902L12.6659 16.2316C11.2991 17.5985 9.08301 17.5985 7.71617 16.2316V16.2316M7.71617 16.2316L-0.00266543 23.9485M16.555 7.39279L23.9484 -0.000610872"
      stroke={color}
    />
  </svg>
)
