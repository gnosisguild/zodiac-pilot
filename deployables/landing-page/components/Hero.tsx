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
    <Container className="pt-20 text-center lg:pt-32">
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
        permissions, and an industry-first sandbox environment — all from an
        intuitive browser side panel. Reduce risk, cut costs, and streamline
        treasury, governance, and DeFi workflows in one seamless interface.
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <PrimaryLinkButton
          icon={SiGooglechrome}
          to="https://chrome.google.com/webstore/detail/zodiac-pilot/jklckajipokenkbbodifahogmidkekcb"
        >
          <span className="hidden md:inline">Add Pilot to Your Browser</span>

          <span className="inline md:hidden">View in Chrome WebStore</span>
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

      <div className="mt-24 2xl:mt-44">
        {children}

        <p className="mb-12 mt-24 text-balance">
          Pilot is already facilitating execution for treasury teams, governance
          protocols, and multisig operators, including
        </p>

        <ul className="flex items-center justify-center gap-x-8 sm:flex-col sm:gap-x-0 sm:gap-y-10 xl:flex-row xl:gap-x-12 xl:gap-y-0">
          <li>
            <ul className="flex flex-col items-center gap-y-8 sm:flex-row sm:gap-x-12 sm:gap-y-0">
              <li className="flex">
                <SafeLogo />
              </li>
              <li className="flex">
                <KarpatkeyLogo />
              </li>
              <li className="flex">
                <HatsLogo />
              </li>
              <li className="flex">
                <RethinkLogo />
              </li>
              <li className="flex">
                <BalancerLogo />
              </li>
              <li className="flex">
                <EnsLogo />
              </li>
              <li className="flex">
                <GnosisLogo />
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </Container>
  )
}
