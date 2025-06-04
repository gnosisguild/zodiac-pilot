import { SiDiscord, SiGithub, SiX } from '@icons-pack/react-simple-icons'
import {
  GhostLinkButton,
  PilotType,
  Strong,
  Text,
  TextLink,
  ZodiacOsIcon,
} from '@zodiac/ui'
import { Container } from './Container'

export function Footer() {
  return (
    <footer>
      <Container>
        <div className="py-16">
          <div className="flex items-center justify-center gap-4">
            <ZodiacOsIcon className="h-10 w-auto" />
            <PilotType className="h-6 dark:invert" />
          </div>

          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <GhostLinkButton to="#features">Features</GhostLinkButton>
              <GhostLinkButton to="#testimonials">Testimonials</GhostLinkButton>
              <GhostLinkButton to="#faqs">FAQs</GhostLinkButton>
            </div>
          </nav>
        </div>

        <Text className="text-balance text-center text-sm">
          Zodiac Pilot is an open-source tool built by{' '}
          <TextLink to="https://gnosisguild.org">Gnosis Guild</TextLink>.
          <br />
          All information is for informational purposes only and does not
          constitute legal, financial, or investment advice.{' '}
          <Strong>Use at your own risk.</Strong>
        </Text>

        <div className="mt-10 flex flex-col items-center border-t border-zinc-900/10 py-10 sm:flex-row-reverse sm:justify-between dark:border-zinc-100/10">
          <div className="flex">
            <GhostLinkButton
              iconOnly
              icon={SiGithub}
              to="https://github.com/gnosisguild/zodiac-pilot"
            >
              View on GitHub
            </GhostLinkButton>

            <GhostLinkButton
              iconOnly
              to="https://twitter.com/gnosisguild"
              icon={SiX}
            >
              Follow us on X
            </GhostLinkButton>

            <GhostLinkButton
              iconOnly
              to="https://discord.gnosisguild.org"
              icon={SiDiscord}
            >
              Contact us on Discord
            </GhostLinkButton>
          </div>
          <Text className="mt-6 text-sm sm:mt-0">
            Copyright &copy; {new Date().getFullYear()}{' '}
            <TextLink to="https://gnosisguild.org">Gnosis Guild</TextLink>. All
            rights reserved.
          </Text>
        </div>
      </Container>
    </footer>
  )
}
