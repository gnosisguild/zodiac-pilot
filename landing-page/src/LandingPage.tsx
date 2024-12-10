import {
  SiChromewebstore,
  SiDiscord,
  SiGithub,
} from '@icons-pack/react-simple-icons'
import { PilotType, ZodiacOsPlain } from './logos'

export const LandingPage = () => (
  <div className="mx-auto flex flex-col justify-between lg:w-2/3">
    <header className="my-24 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <ZodiacOsPlain className="h-8" />
        <PilotType className="h-10 dark:invert" />
      </div>

      <aside className="flex gap-4">
        <a
          href="https://discord.gg/tXugWAMX"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="sr-only">Open Discord</span>
          <SiDiscord className="size-8" />
        </a>

        <a
          href="https://github.com/gnosis/zodiac-pilot"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="sr-only">View on GitHub</span>
          <SiGithub className="size-8" />
        </a>
      </aside>
    </header>
    <main className="flex flex-col gap-24">
      <h1 className="text-balance text-center text-5xl font-thin">
        Secure, flexible, smart accounts with the ease of a browser extension.
      </h1>

      <section className="flex items-center justify-around gap-4">
        <div className="rounded-xl border border-gray-300/80 p-4 shadow-2xl dark:border-gray-700/80 dark:shadow-zinc-800">
          <img
            src="/extension-dark.png"
            className="hidden w-fit dark:block"
            alt="Zodiac browser extension"
          />

          <img
            src="/extension-light.png"
            className="w-fit dark:hidden"
            alt="Zodiac browser extension"
          />
        </div>

        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-4 text-2xl font-extralight text-zinc-500 dark:text-zinc-300">
            <p>Trusted by institutions.</p>
            <p>Flexible enough for individuals.</p>
            <p>Let Pilot guide your transactions.</p>
          </div>

          <a
            href="https://chrome.google.com/webstore/detail/zodiac-pilot/jklckajipokenkbbodifahogmidkekcb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center justify-center gap-4 whitespace-nowrap rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-50 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            <SiChromewebstore />
            Add to Chrome
          </a>
        </div>
      </section>
    </main>
  </div>
)
