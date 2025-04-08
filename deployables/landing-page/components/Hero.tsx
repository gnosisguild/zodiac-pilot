import klerosLogo from '@/images/kleros-logo.png'
import { SiGithub, SiGooglechrome } from '@icons-pack/react-simple-icons'
import { PrimaryLinkButton, SecondaryLinkButton } from '@zodiac/ui'
import { GraduationCap } from 'lucide-react'
import { useEffect, useRef, type PropsWithChildren } from 'react'
import { annotate } from 'rough-notation'
import { Container } from './Container'
import {
  ArbitrumOne,
  BalancerLogo,
  EnsLogo,
  GnosisLogo,
  GnosisPay,
  HatsLogo,
  KarpatkeyLogo,
  OneInch,
  RethinkLogo,
  SafeLogo,
  Tally,
} from './logos'

export function Hero({ children }: PropsWithChildren) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current == null) {
      return
    }

    const annotation = annotate(ref.current, {
      type: 'underline',
      strokeWidth: 7,
      iterations: 3,
    })

    annotation.show()

    return () => {
      annotation.remove()
    }
  }, [])

  return (
    <Container className="pt-20 text-center lg:pt-32">
      <h1 className="font-display mx-auto max-w-4xl text-5xl font-medium tracking-tight text-zinc-900 sm:text-7xl dark:text-white">
        <span className="relative whitespace-nowrap text-indigo-600 dark:text-teal-500">
          <span ref={ref} className="relative dark:text-teal-500">
            Smart Execution
          </span>
        </span>{' '}
        for
        <br />
        <span className="relative z-10">Smart Accounts</span>
      </h1>
      <p className="mx-auto mb-6 mt-12 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
        Zodiac Pilot is a powerful execution interface for Safe accounts
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

      <div className="mt-24 2xl:mt-28">
        <h3 className="mb-16 font-semibold">
          Zodiac is battle-tested and trusted by leading organizations
        </h3>

        {children}

        <ul className="mt-24 flex flex-col items-center justify-center gap-8 2xl:mt-44">
          <li>
            <ul className="grid grid-cols-3 flex-col items-center gap-8 sm:flex-row sm:gap-x-12 sm:gap-y-0 xl:flex">
              <li className="flex justify-center">
                <a href="https://safe.global/">
                  <SafeLogo />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://kpk.io/">
                  <KarpatkeyLogo />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://hats.finance/">
                  <HatsLogo />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://www.rethink.finance/">
                  <RethinkLogo />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://balancer.fi/">
                  <BalancerLogo />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://ens.domains/">
                  <EnsLogo />
                </a>
              </li>
              <li className="col-span-3 flex justify-center">
                <a href="https://www.gnosis.io/dao">
                  <GnosisLogo />
                </a>
              </li>
            </ul>
          </li>
          <li>
            <ul className="grid grid-cols-3 flex-col items-center gap-8 sm:flex-row sm:gap-x-12 sm:gap-y-0 xl:flex">
              <li className="flex justify-center">
                <a href="https://arbitrum.io/">
                  <ArbitrumOne />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://1inch.io/">
                  <OneInch />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://gnosispay.com/">
                  <GnosisPay />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://kleros.io">
                  <img
                    src={klerosLogo}
                    alt=""
                    className="h-10 invert dark:invert-0"
                  />
                </a>
              </li>
              <li className="flex justify-center">
                <a href="https://www.tally.xyz/">
                  <Tally />
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </Container>
  )
}
