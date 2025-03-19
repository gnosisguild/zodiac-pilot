import accountOverviewDark from '@/images/features/account-overview-dark.png'
import accountOverviewLight from '@/images/features/account-overview-light.png'
import balancesDark from '@/images/features/balances-dark.png'
import balancesLight from '@/images/features/balances-light.png'
import editDark from '@/images/features/edit-account-dark.png'
import editLight from '@/images/features/edit-account-light.png'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import classNames from 'classnames'
import { Library, Split, SwatchBook } from 'lucide-react'
import { Container } from './Container'

interface Feature {
  name: React.ReactNode
  summary: string
  image: [light: string, dark: string]
  icon: React.ComponentType
}

const features: Array<Feature> = [
  {
    name: 'Multi-Account Management',
    summary:
      'View balances, switch between Safe accounts, and transfer tokens — streamlining treasury operations.',
    image: [accountOverviewLight, accountOverviewDark],
    icon: Library,
  },
  {
    name: 'Route Customization & Sharing',
    summary:
      'Construct, edit, and share execution routes for flexible, repeatable workflows across teams.',

    image: [balancesLight, balancesDark],
    icon: SwatchBook,
  },
  {
    name: 'Automated Pathfinding',
    summary:
      'Pilot intelligently identifies transaction routes between signer accounts and target destinations — you simply choose the best option for your needs.',

    image: [editLight, editDark],
    icon: Split,
  },
]

function Feature({
  feature,
  isActive,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  feature: Feature
  isActive: boolean
}) {
  return (
    <div
      className={classNames(
        'grid grid-rows-subgrid',
        className,
        !isActive && 'opacity-75 hover:opacity-100',
      )}
      {...props}
    >
      <div>
        <div
          className={classNames(
            'flex size-9 w-9 items-center justify-center rounded-lg',
            isActive
              ? 'bg-indigo-500 text-indigo-50 dark:bg-teal-600 dark:text-teal-50'
              : 'bg-zinc-300 dark:bg-zinc-500',
          )}
        >
          <feature.icon />
        </div>
        <h3
          className={classNames(
            'mt-6 text-sm font-medium',
            isActive
              ? 'text-indigo-600 dark:text-teal-600'
              : 'text-zinc-600 dark:text-zinc-50',
          )}
        >
          {feature.name}
        </h3>
        <p className="font-display mt-2 text-xl text-zinc-900 dark:text-zinc-50">
          {feature.summary}
        </p>
      </div>
    </div>
  )
}

function FeaturesMobile() {
  return (
    <div className="-mx-4 mt-20 flex flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:hidden">
      {features.map((feature) => (
        <div key={feature.summary}>
          <Feature feature={feature} className="mx-auto max-w-2xl" isActive />
          <div className="relative mt-10 pb-10">
            <div className="absolute -inset-x-4 bottom-0 top-8 bg-zinc-200 sm:-inset-x-6 dark:bg-zinc-800" />
            <div className="relative mx-auto w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-500/10 dark:bg-black"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FeaturesDesktop() {
  return (
    <TabGroup className="hidden lg:mt-20 lg:block">
      {({ selectedIndex }) => (
        <>
          <TabList className="grid grid-cols-3 gap-x-8">
            {features.map((feature, featureIndex) => (
              <Feature
                key={feature.summary}
                feature={{
                  ...feature,
                  name: (
                    <Tab className="data-selected:not-data-focus:outline-hidden">
                      <span className="absolute inset-0" />
                      {feature.name}
                    </Tab>
                  ),
                }}
                isActive={featureIndex === selectedIndex}
                className="relative"
              />
            ))}
          </TabList>
          <TabPanels className="rounded-4xl bg-radial relative mt-20 overflow-hidden from-zinc-300 to-zinc-50 px-14 py-16 xl:px-16 dark:bg-zinc-800 dark:from-zinc-700 dark:to-zinc-900">
            <div className="-mx-5 flex">
              {features.map(
                ({ summary, image: [light, dark] }, featureIndex) => (
                  <TabPanel
                    static
                    key={summary}
                    className={classNames(
                      'data-selected:not-data-focus:outline-hidden px-5 transition duration-500 ease-in-out',
                      featureIndex !== selectedIndex && 'opacity-60',
                    )}
                    style={{
                      transform: `translateX(-${selectedIndex * 100}%)`,
                    }}
                    aria-hidden={featureIndex !== selectedIndex}
                  >
                    <div className="w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-500/10 dark:bg-zinc-800">
                      <img
                        className="w-full dark:hidden"
                        src={light}
                        alt=""
                        sizes="52.75rem"
                      />

                      <img
                        className="hidden w-full dark:block"
                        src={dark}
                        alt=""
                        sizes="52.75rem"
                      />
                    </div>
                  </TabPanel>
                ),
              )}
            </div>
            <div className="rounded-4xl pointer-events-none absolute inset-0 ring-1 ring-inset ring-zinc-900/10" />
          </TabPanels>
        </>
      )}
    </TabGroup>
  )
}

export function SecondaryFeatures() {
  return (
    <section
      id="secondary-features"
      aria-label="Features for simplifying everyday business tasks"
      className="snap-start pb-14 pt-20 sm:pb-20 sm:pt-32 lg:pb-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-zinc-900 sm:text-4xl dark:text-slate-50">
            Manage Accounts & Execution Routes
          </h2>
          <p className="mt-4 text-lg tracking-tight text-zinc-700 dark:text-slate-300">
            In addition to the side panel, Pilot makes it easy to track assets
            across multiple Safe accounts and customize transaction routing —
            ensuring smooth, efficient onchain operations.
          </p>
        </div>
        <FeaturesMobile />
        <FeaturesDesktop />
      </Container>
    </section>
  )
}
