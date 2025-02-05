import { PilotType, ZodiacOsPlain } from '@zodiac/ui'
import classNames from 'classnames'
import {
  Edit,
  Landmark,
  Plus,
  SendHorizonal,
  type LucideIcon,
} from 'lucide-react'
import type { ComponentProps, PropsWithChildren } from 'react'
import { NavLink, Outlet } from 'react-router'

const Sidebar = () => {
  return (
    <div className="flex flex-1">
      <div className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950">
        <div className="my-12 flex items-center justify-center gap-2">
          <ZodiacOsPlain className="h-6" />
          <PilotType className="h-7 dark:invert" />
        </div>

        <nav className="flex flex-col gap-8">
          <SidebarSection title="Tokens">
            <SidebarLink to="/tokens/send" icon={SendHorizonal}>
              Send tokens
            </SidebarLink>

            <SidebarLink to="/tokens/balances" icon={Landmark}>
              Balances
            </SidebarLink>
          </SidebarSection>

          <SidebarSection title="Routes">
            <SidebarLink to="/new-route" icon={Plus}>
              Create new route
            </SidebarLink>

            <SidebarLink to="/edit-route" icon={Edit}>
              Edit a route
            </SidebarLink>
          </SidebarSection>
        </nav>
      </div>

      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default Sidebar

type SidebarSectionProps = PropsWithChildren<{ title: string }>

const SidebarSection = ({ title, children }: SidebarSectionProps) => (
  <section>
    <h2 className="mx-6 mb-1 text-xs font-semibold uppercase opacity-50">
      {title}
    </h2>

    {children}
  </section>
)

type SidebarLinkProps = Pick<
  ComponentProps<typeof NavLink>,
  'to' | 'children'
> & { icon: LucideIcon }

const SidebarLink = ({ children, to, icon: Icon }: SidebarLinkProps) => (
  <NavLink
    to={to}
    className="flex items-center gap-4 px-6 py-2 hover:bg-zinc-300/60 dark:hover:bg-zinc-800/80"
  >
    {({ isActive }) => (
      <>
        <div
          className={classNames(
            'flex items-center justify-center rounded-full p-1.5',
            isActive &&
              'bg-indigo-600 text-indigo-50 dark:bg-teal-300 dark:text-teal-900',
          )}
        >
          <Icon
            size={18}
            className={classNames(isActive ? 'opacity-100' : 'opacity-50')}
          />
        </div>
        {children}
      </>
    )}
  </NavLink>
)
