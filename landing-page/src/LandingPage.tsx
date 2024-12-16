import {
  SiChromewebstore,
  SiDiscord,
  SiGithub,
} from '@icons-pack/react-simple-icons'
import { PilotType, ZodiacOsPlain } from './logos'

export const LandingPage = () => (
  <div className="mx-8 my-8 flex flex-col justify-between lg:mx-auto lg:w-2/3">
    <header className="mb-24 flex items-center justify-between lg:my-24">
      <div className="flex items-center gap-4">
        <ZodiacOsPlain className="h-6 lg:h-8" />
        <PilotType className="h-8 lg:h-10 dark:invert" />
      </div>

      <aside className="flex gap-4">
        <a
          href="https://discord.gg/tXugWAMX"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="sr-only">Open Discord</span>
          <SiDiscord className="size-6 lg:size-8" />
        </a>

        <a
          href="https://github.com/gnosis/zodiac-pilot"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="sr-only">View on GitHub</span>
          <SiGithub className="size-6 lg:size-8" />
        </a>
      </aside>
    </header>
    <main className="flex max-w-7xl flex-col justify-center gap-24 self-center">
      <h1 className="text-balance text-center text-3xl font-thin lg:text-5xl">
        Secure, flexible, smart accounts with the ease of a browser extension.
      </h1>

      <section className="flex flex-col-reverse items-center justify-around gap-32 lg:flex-row">
        <div className="w-96 rounded-xl border border-gray-300/80 p-4 shadow-2xl dark:border-gray-700/80 dark:shadow-zinc-800">
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
          <div className="flex flex-col gap-4 text-balance text-center text-zinc-500 md:text-xl md:font-extralight lg:text-2xl xl:text-left dark:text-zinc-300">
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
