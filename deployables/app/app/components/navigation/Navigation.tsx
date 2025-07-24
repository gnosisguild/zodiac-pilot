import { SidebarBody, SidebarItem, SidebarSection } from '@zodiac/ui'
import type { LucideIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { NavLink, useLocation, type Location } from 'react-router'

export const Navigation = ({ children }: PropsWithChildren) => (
  <SidebarBody>{children}</SidebarBody>
)

type SectionProps = PropsWithChildren<{ title: string }>

const Section = ({ title, children }: SectionProps) => (
  <SidebarSection>
    <h2 className="mb-2 text-xs font-semibold uppercase opacity-50">{title}</h2>

    {children}
  </SidebarSection>
)

Navigation.Section = Section

type LinkProps = PropsWithChildren<{
  to: string
  reloadDocument?: boolean | ((location: Location) => boolean)
  icon: LucideIcon
}>

const Link = ({ children, to, icon: Icon, reloadDocument }: LinkProps) => {
  const location = useLocation()

  return (
    <NavLink
      to={to}
      prefetch="render"
      reloadDocument={
        reloadDocument == null || typeof reloadDocument === 'boolean'
          ? reloadDocument
          : reloadDocument(location)
      }
    >
      {({ isActive }) => (
        <SidebarItem current={isActive}>
          <Icon size={18} />

          {children}
        </SidebarItem>
      )}
    </NavLink>
  )
}

Navigation.Link = Link
