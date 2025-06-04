import { SiGooglechrome } from '@icons-pack/react-simple-icons'
import { PrimaryLinkButton, ZodiacOsIcon } from '@zodiac/ui'

export function CallToAction() {
  return (
    <section id="get-started-today" className="h-screen snap-start">
      <div className="xl:bg-radial-[at_50%_55%] h-full from-teal-300 to-40% dark:from-teal-600 dark:to-zinc-950">
        <div className="mx-4 flex h-full max-w-lg flex-col items-center justify-center text-center xl:mx-auto">
          <ZodiacOsIcon className="mb-16 size-16 xl:mb-24 xl:size-24" />

          <h2 className="font-display text-3xl tracking-tight sm:text-4xl dark:text-white">
            Start Using Zodiac Pilot
          </h2>

          <p className="mb-10 mt-4 text-lg tracking-tight dark:text-white">
            Add Zodiac Pilot to your browser to batch, simulate, and execute
            onchain transactions — all from a secure, streamlined interface.
          </p>

          <div className="flex justify-center">
            <PrimaryLinkButton
              icon={SiGooglechrome}
              to="https://chrome.google.com/webstore/detail/zodiac-pilot/jklckajipokenkbbodifahogmidkekcb"
            >
              Add Pilot to Your Browser
            </PrimaryLinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}
