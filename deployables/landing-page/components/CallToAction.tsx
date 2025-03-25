import { SiGooglechrome } from '@icons-pack/react-simple-icons'
import { PrimaryLinkButton, ZodiacOsPlain } from '@zodiac/ui'

export function CallToAction() {
  return (
    <section id="get-started-today" className="h-screen snap-start">
      <div className="xl:bg-radial-[at_50%_55%] h-full from-teal-600 to-zinc-950 to-40%">
        <div className="mx-4 flex h-full max-w-lg flex-col items-center justify-center text-center xl:mx-auto">
          <ZodiacOsPlain className="mb-16 size-16 xl:mb-24 xl:size-24" />

          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Start Using Zodiac Pilot
          </h2>

          <p className="mb-10 mt-4 text-lg tracking-tight text-white">
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
