import { Strong, Text, TextLink } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'

export const FAQs = () => {
  return (
    <section
      id="faqs"
      className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Frequently asked questions
        </h2>
        <p className="mt-6 text-base/7 text-zinc-600 dark:text-zinc-200">
          Have a different question and can’t find the answer you’re looking
          for? Reach out to our support team by{' '}
          <a
            href="mailto:info@gnosisguild.org"
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-teal-500 dark:hover:text-teal-400"
          >
            sending us an email
          </a>{' '}
          and we’ll get back to you as soon as we can.
        </p>
      </div>
      <div className="mt-20">
        <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
          <FAQ question="Who built Pilot?">
            Pilot was built by{' '}
            <TextLink to="https://gnosisguild.org">Gnosis Guild</TextLink>, a
            web3-native venture builder incubated in{' '}
            <TextLink to="https://www.gnosis.io/dao">GnosisDAO</TextLink>{' '}
            alongside <TextLink to="https://safe.global/">Safe</TextLink> before
            spinning out as an independent entity.
          </FAQ>

          <FAQ question="What is Zodiac?">
            In addition to Pilot,{' '}
            <TextLink to="https://gnosisguild.org">Gnosis Guild</TextLink> is
            the creator of Zodiac, an open standard for smart accounts that has
            led to a suite of open-source modules for{' '}
            <TextLink to="https://safe.global/">Safe</TextLink>. Pilot itself
            isn't a Zodiac module, but integrates directly with the Zodiac
            ecosystem (specifically{' '}
            <TextLink to="https://www.zodiac.wiki/documentation/roles-modifier">
              Zodiac Roles
            </TextLink>{' '}
            for role-based permissions).
          </FAQ>

          <FAQ question="Do I need custom smart contracts or Safe modules to use Pilot?">
            <Strong>No.</Strong> Pilot works with your existing{' '}
            <TextLink to="https://safe.global/">Safe</TextLink> setup — no
            additional contracts or modules required.
          </FAQ>

          <FAQ question="Does Pilot work with all dapps?">
            <Strong>Yes.</Strong> Pilot enables multi-dapp execution without
            requiring custom integrations. Users can interact with Aave,
            Uniswap, Balancer, and more directly from the side panel.
          </FAQ>

          <FAQ question="Is Pilot secure?">
            <Strong>Yes.</Strong> Pilot extends{' '}
            <TextLink to="https://safe.global/">Safe’s</TextLink> execution
            capabilities without modifying its security model. Transactions
            remain non-custodial, signed by{' '}
            <TextLink to="https://safe.global/">Safe’s</TextLink> multisig
            permissions, and fully transparent.
          </FAQ>

          <FAQ question="Is Pilot available on mobile or non-Chromium browsers?">
            Not currently. Pilot is a desktop-only tool, compatible exclusively
            with Chromium-based browsers like Chrome, Brave, and Opera. Mobile
            support is not available at this time.
          </FAQ>

          <FAQ question="Does Pilot work for individual users, or just teams?">
            <Strong>Both.</Strong> While treasury teams and DAOs benefit from
            batching and role-based execution, individual users can use Pilot
            to:
            <ul className="ml-4 mt-4 list-disc">
              <li>Automate frequent interactions and reduce signer fatigue.</li>
              <li>
                Batch approvals across dapps for a smoother user experience.
              </li>
              <li>
                Test transactions before signing to prevent failed transactions
                and unexpected costs.
              </li>
            </ul>
          </FAQ>
        </dl>
      </div>
    </section>
  )
}

type FAQProps = PropsWithChildren<{
  question: string
}>

const FAQ = ({ question, children }: FAQProps) => (
  <div>
    <dt className="text-base/7 font-semibold text-zinc-900 dark:text-zinc-50">
      {question}
    </dt>
    <dd className="mt-2 text-base/7">
      <Text>{children}</Text>
    </dd>
  </div>
)
