import {
  CallToAction,
  FAQs,
  Footer,
  Header,
  Hero,
  PrimaryFeatures,
  SecondaryFeatures,
  Stats,
  Testimonials,
} from '@/components'
import { DuneClient } from '@duneanalytics/client-sdk'
import { invariantResponse } from '@epic-web/invariant'
import type { Route } from './+types/LandingPage'

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const dune = new DuneClient(context.cloudflare.env.DUNE_ANALYTICS_API_KEY)
    const [{ result: totalTransactedValue }, { result: totalValueSecured }] =
      await Promise.all([
        dune.getLatestResult({ queryId: 4175289 }),
        dune.getLatestResult({ queryId: 4151598 }),
      ])

    invariantResponse(totalTransactedValue != null, 'Could not load TTV')
    invariantResponse(totalValueSecured != null, 'Could not load TVS')

    const [ttvRow] = totalTransactedValue.rows
    const [tvsRow] = totalValueSecured.rows

    const usdFormatter = new Intl.NumberFormat('en-us', {
      currency: 'USD',
      notation: 'compact',
      style: 'currency',
    })

    const numberFormatter = new Intl.NumberFormat('en-us', {
      notation: 'compact',
      style: 'decimal',
    })

    return {
      ttv: usdFormatter.format(ttvRow['total_usd_value'] as number),
      tvs: usdFormatter.format(tvsRow['total'] as number),
      ttp: numberFormatter.format(ttvRow['total_tx_count'] as number),
    }
  } catch {
    return {
      ttv: null,
      tvs: null,
      ttp: null,
    }
  }
}

export const LandingPage = ({
  loaderData: { ttv, tvs, ttp },
}: Route.ComponentProps) => {
  return (
    <div className="flex flex-col">
      <Header />

      <main className="flex flex-col">
        <Hero>
          {ttv != null && tvs != null && ttp != null && (
            <Stats>
              <Stats.Stat name="Total transacted value">{ttv}</Stats.Stat>
              <Stats.Stat name="Total value secured">{tvs}</Stats.Stat>
              <Stats.Stat name="Total transactions processed">{ttp}</Stats.Stat>
            </Stats>
          )}
        </Hero>

        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
        <Testimonials />
        <FAQs />
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
