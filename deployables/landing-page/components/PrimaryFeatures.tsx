import { Divider } from '@zodiac/ui'
import {
  AppWindow,
  BookOpenCheck,
  Boxes,
  FlaskConical,
  Group,
  ListCheck,
  ListChecks,
  Lock,
  Milestone,
  PackageOpen,
  ShieldPlus,
  Wallet,
} from 'lucide-react'
import { Description } from './Description'
import { Feature } from './Feature'

export function PrimaryFeatures() {
  return (
    <section
      id="features"
      aria-label="Features for running your books"
      className="relative pb-28 pt-20 sm:py-32"
    >
      <Feature
        color="teal"
        section="Feature"
        title="Smart Execution for Safe Accounts"
        description="Pilot enables scalable, programmable execution for Safe accounts — supporting both individual users and large-scale on-chain operations."
      >
        <Description>
          <Description.Item
            icon={ListCheck}
            color="teal"
            title="Move beyond single-step approvals"
          >
            Automate multi-dapp execution paths and reduce manual coordination
            overhead.
          </Description.Item>

          <Description.Item
            icon={Wallet}
            color="teal"
            title="Reduce transaction costs"
          >
            Batch interactions across dapps to minimize gas fees.
          </Description.Item>

          <Description.Item
            icon={BookOpenCheck}
            color="teal"
            title="Trusted at scale"
          >
            Pilot facilitates secure, non-custodial execution for over $2B in
            DAO treasuries, including kpk (formerly karpatkey), ENS DAO,
            Balancer, and GnosisDAO.
          </Description.Item>
        </Description>
      </Feature>

      <Divider />

      <Feature
        color="indigo"
        section="Feature"
        title="Seamless Dapp Interactions"
        description="Pilot integrates Safe workflows directly into dapp interactions, eliminating the need for external approvals and custom integrations."
      >
        <Description>
          <Description.Item
            color="indigo"
            icon={AppWindow}
            title="One interface, no extra windows  "
          >
            Pilot’s browser-native side panel embeds Safe execution into dapps.
          </Description.Item>

          <Description.Item
            icon={FlaskConical}
            color="indigo"
            title="Test and execute transactions in one place"
          >
            Minimize coordination overhead for multisig signers.
          </Description.Item>

          <Description.Item
            icon={Boxes}
            color="indigo"
            title="Seamless execution across protocols"
          >
            Move assets, execute swaps, and rebalance liquidity without leaving
            the workflow.
          </Description.Item>
        </Description>
      </Feature>

      <Divider />

      <Feature
        color="amber"
        section="Feature"
        title="Maximize Efficiency, Minimize Risk"
        description="Pilot eliminates transaction uncertainty with its advanced batching capabilities and industry-first simulation forks, providing a secure environment to test workflows before execution and maximizing capital efficiency."
      >
        <Description>
          <Description.Item
            color="amber"
            icon={Group}
            title="Group transactions into a single batch"
          >
            Execute multi-dapp workflows in one transaction to minimize gas
            costs and operational overhead.
          </Description.Item>

          <Description.Item
            icon={PackageOpen}
            color="amber"
            title="Simulate transactions in a dedicated sandbox"
          >
            Detect and fix errors in DeFi strategies, treasury operations, and
            DAO proposals before committing onchain.
          </Description.Item>

          <Description.Item
            icon={ListChecks}
            color="amber"
            title="Validate smart contract interactions before execution"
          >
            Test transaction flows in a secure, off-chain environment to
            minimize risk and prevent costly failures.
          </Description.Item>
        </Description>
      </Feature>

      <Divider />

      <Feature
        color="pink"
        section="Feature"
        title="Delegate with Advanced Permissions"
        description="Pilot enables secure delegation with fine-grained permissions using Zodiac Roles Modifier, allowing accounts to define precise, programmable execution rules."
      >
        <Description>
          <Description.Item
            color="pink"
            icon={Lock}
            title="Assign tightly scoped permissions"
          >
            Avoid unnecessary signer fatigue while enforcing security controls.
          </Description.Item>

          <Description.Item
            icon={ShieldPlus}
            color="pink"
            title="Limit execution risk"
          >
            Specify which transactions can be executed, by whom, and under what
            conditions.
          </Description.Item>

          <Description.Item
            icon={Milestone}
            color="pink"
            title="Reduce governance bottlenecks"
          >
            Teams can batch, delegate, and execute workflows without manual
            approvals at every step.
          </Description.Item>
        </Description>
      </Feature>
    </section>
  )
}
