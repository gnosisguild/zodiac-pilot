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
      className="relative overflow-hidden pb-28 pt-20 sm:py-32"
    >
      <Feature
        color="teal"
        section="Section A"
        title="Secure Execution for Smart Accounts"
        description="Pilot powers institutional-grade treasury management, helping DAOs and other onchain entities reduce overhead and optimize operations through secure, efficient execution."
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
            DAO treasuries, including karpatkey, ENS DAO, Balancer, and
            GnosisDAO.
          </Description.Item>
        </Description>
      </Feature>

      <Divider />

      <Feature
        color="indigo"
        section="Section B"
        title="Seamless Interactions with Dapps"
        description="Pilot integrates Safe workflows directly into dapp interactions, making transactions smooth, intuitive, and cost-efficient."
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
        section="Section C"
        title="Maximize Efficiency, Reduce Risk"
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
        color="blue"
        section="Section D"
        title="Delegate Securely with Advanced Permissions"
        description="Pilot enables secure delegation with fine-grained permissions using Zodiac Roles Modifier — the most expressive conditions system for permissioning EVM calls."
      >
        <Description>
          <Description.Item
            color="blue"
            icon={Lock}
            title="Assign tightly scoped permissions"
          >
            Avoid unnecessary signer fatigue while enforcing security controls.
          </Description.Item>

          <Description.Item
            icon={ShieldPlus}
            color="blue"
            title="Limit execution risk"
          >
            Specify which transactions can be executed, by whom, and under what
            conditions.
          </Description.Item>

          <Description.Item
            icon={Milestone}
            color="blue"
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
