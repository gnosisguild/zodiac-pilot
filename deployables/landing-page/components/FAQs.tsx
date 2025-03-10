import type { PropsWithChildren } from 'react'

export const FAQs = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Frequently asked questions
        </h2>
        <p className="mt-6 text-base/7 text-gray-600">
          Have a different question and can’t find the answer you’re looking
          for? Reach out to our support team by{' '}
          <a
            href="#"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            sending us an email
          </a>{' '}
          and we’ll get back to you as soon as we can.
        </p>
      </div>
      <div className="mt-20">
        <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
          <FAQ question="Who built Pilot?">
            Pilot was built by Gnosis Guild, a web3-native venture builder
            incubated in GnosisDAO alongside Safe before spinning out as an
            independent entity.
          </FAQ>

          <FAQ question="What is Zodiac?">
            In addition to Pilot, Gnosis Guild is the creator of Zodiac, an open
            standard for smart accounts that has led to a suite of open-source
            modules for Safe. Pilot itself isn't a Zodiac module, but integrates
            directly with the Zodiac ecosystem (specifically Zodiac Roles for
            role-based permissions).
          </FAQ>

          <FAQ question="Do I need custom smart contracts or Safe modules to use Pilot?">
            <strong>No.</strong> Pilot works with your existing Safe setup — no
            additional contracts or modules required.
          </FAQ>

          <FAQ question="Does Pilot work with all dapps?">
            <strong>Yes.</strong> Pilot enables multi-dapp execution without
            requiring custom integrations. Users can interact with Aave,
            Uniswap, Balancer, and more directly from the side panel.
          </FAQ>

          <FAQ question="Is Pilot secure?">
            <strong>Yes.</strong> Pilot extends Safe’s execution capabilities
            without modifying its security model. Transactions remain
            non-custodial, signed by Safe’s multisig permissions, and fully
            transparent.
          </FAQ>

          <FAQ question="Does Pilot work for individual users, or just teams?">
            <strong>Both.</strong> While treasury teams and DAOs benefit from
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

          <FAQ question="Is Pilot available on mobile or non-Chromium browsers?">
            Not currently. Pilot is a desktop-only tool, compatible exclusively
            with Chromium-based browsers like Chrome, Brave, and Opera. Mobile
            support is not available at this time.
          </FAQ>
        </dl>
      </div>
    </div>
  )
}

type FAQProps = PropsWithChildren<{
  question: string
}>

const FAQ = ({ question, children }: FAQProps) => (
  <div>
    <dt className="text-base/7 font-semibold text-gray-900">{question}</dt>
    <dd className="mt-2 text-base/7 text-gray-600">{children}</dd>
  </div>
)
