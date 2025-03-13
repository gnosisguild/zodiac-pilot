import panelDark from '@/images/page/panel-dark.png'
import panelLight from '@/images/page/panel-light.png'
import { SiGithub, SiGooglechrome } from '@icons-pack/react-simple-icons'
import { PrimaryLinkButton, SecondaryLinkButton } from '@zodiac/ui'
import { GraduationCap } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Container } from './Container'
import {
  BalancerLogo,
  EnsLogo,
  GnosisLogo,
  HatsLogo,
  KarpatkeyLogo,
  RethinkLogo,
  SafeLogo,
} from './logos'

export function Hero({ children }: PropsWithChildren) {
  return (
    <>
      <div className="mx-auto mt-20 flex flex-col rounded-lg border border-zinc-200 shadow-2xl lg:mt-32 dark:border-zinc-800 dark:shadow-zinc-100/10">
        <div className="relative flex justify-center border-b border-zinc-200 bg-zinc-100 py-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-3">
            <div className="size-3 rounded-full bg-slate-400 dark:bg-zinc-500" />
            <div className="size-3 rounded-full bg-slate-400 dark:bg-zinc-500" />
            <div className="size-3 rounded-full bg-slate-400 dark:bg-zinc-500" />
          </div>

          <div className="rounded-md border border-zinc-300 bg-zinc-100 px-12 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
            app.pilot.gnosisguild.org
          </div>
        </div>
        <div className="flex text-center">
          <div className="mx-24 flex flex-1 flex-col items-center justify-center">
            <h1 className="font-display mx-auto max-w-4xl text-5xl font-medium tracking-tight text-zinc-900 sm:text-7xl dark:text-white">
              Granular Control,
              <br />
              <span className="relative whitespace-nowrap text-indigo-600 dark:text-teal-600">
                <span className="relative">Dynamic</span>
              </span>{' '}
              Execution
            </h1>
            <p className="mx-auto mb-6 mt-12 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
              Zodiac Pilot makes Safe execution smarter, faster, and safer.
            </p>
            <p className="mx-auto mb-12 max-w-2xl text-balance tracking-tight text-zinc-700 dark:text-zinc-400">
              Build multi-dapp transactions with modular batching, programmable
              permissions, and an industry-first sandbox environment — all from
              an intuitive browser side panel. Reduce risk, cut costs, and
              streamline treasury, governance, and DeFi workflows in one
              seamless interface.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <PrimaryLinkButton
                icon={SiGooglechrome}
                to="https://chrome.google.com/webstore/detail/zodiac-pilot/jklckajipokenkbbodifahogmidkekcb"
              >
                <span className="hidden md:inline">
                  Add Pilot to Your Browser
                </span>

                <span className="inline md:hidden">
                  View in Chrome WebStore
                </span>
              </PrimaryLinkButton>

              <SecondaryLinkButton
                icon={SiGithub}
                to="https://github.com/gnosisguild/zodiac-pilot"
              >
                View on GitHub
              </SecondaryLinkButton>

              <SecondaryLinkButton
                to="https://www.zodiac.wiki/documentation/pilot-extension"
                icon={GraduationCap}
              >
                Explore operator tutorial
              </SecondaryLinkButton>
            </div>
          </div>

          <div className="bg-zinc-100 p-2 dark:bg-zinc-800">
            <img
              src={panelDark}
              className="hidden rounded-2xl dark:block"
              alt=""
            />
            <img src={panelLight} className="rounded-2xl dark:hidden" alt="" />
          </div>
        </div>
      </div>
      <Container className="text-center">
        <div className="mt-24 2xl:mt-44">
          {children}

          <p className="mb-12 mt-24 text-balance">
            Pilot is already facilitating execution for treasury teams,
            governance protocols, and multisig operators, including
          </p>

          <ul className="flex items-center justify-center gap-x-8 sm:flex-col sm:gap-x-0 sm:gap-y-10 xl:flex-row xl:gap-x-12 xl:gap-y-0">
            <li>
              <ul className="flex flex-col items-center gap-y-8 sm:flex-row sm:gap-x-12 sm:gap-y-0">
                <li className="flex">
                  <a href="https://safe.global/">
                    <SafeLogo />
                  </a>
                </li>
                <li className="flex">
                  <a href="https://www.karpatkey.com/">
                    <KarpatkeyLogo />
                  </a>
                </li>
                <li className="flex">
                  <a href="https://hats.finance/">
                    <HatsLogo />
                  </a>
                </li>
                <li className="flex">
                  <a href="https://www.rethink.finance/">
                    <RethinkLogo />
                  </a>
                </li>
                <li className="flex">
                  <a href="https://balancer.fi/">
                    <BalancerLogo />
                  </a>
                </li>
                <li className="flex">
                  <a href="https://ens.domains/">
                    <EnsLogo />
                  </a>
                </li>
                <li className="flex">
                  <a href="https://www.gnosis.io/dao">
                    <GnosisLogo />
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </Container>
    </>
  )
}
