import classNames from 'classnames'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, PropsWithChildren } from 'react'
import { NavLink } from 'react-router'

export const Navigation = ({ children }: PropsWithChildren) => (
  <nav className="flex flex-col gap-8">{children}</nav>
)

type SectionProps = PropsWithChildren<{ title: string }>

const Section = ({ title, children }: SectionProps) => (
  <section>
    <h2 className="mx-6 mb-1 text-xs font-semibold uppercase opacity-50">
      {title}
    </h2>

    {children}
  </section>
)

Navigation.Section = Section

type LinkProps = Pick<ComponentProps<typeof NavLink>, 'to' | 'children'> & {
  icon: LucideIcon
}

const Link = ({ children, to, icon: Icon }: LinkProps) => (
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

Navigation.Link = Link
