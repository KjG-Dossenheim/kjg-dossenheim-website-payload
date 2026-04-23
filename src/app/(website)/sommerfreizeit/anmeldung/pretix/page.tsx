import { getPayload } from 'payload'

import config from '@payload-config'
import type { SommerfreizeitEvent } from '@/payload-types'

export const revalidate = 600

async function getPretixEvent() {
  const payload = await getPayload({ config })

  const landingPageData = await payload.findGlobal({
    slug: 'sommerfreizeitLandingPage',
    select: {
      freizeit: true,
    },
  })

  const eventId =
    typeof landingPageData.freizeit === 'string'
      ? landingPageData.freizeit
      : landingPageData.freizeit?.id

  if (!eventId) {
    throw new Error('Keine Sommerfreizeit im Landing-Global verknuepft.')
  }

  const eventData = (await payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventId,
  })) as SommerfreizeitEvent

  if (!eventData.pretixEventId) {
    throw new Error('Die verknuepfte Sommerfreizeit hat keine Pretix Event ID.')
  }

  return eventData.pretixEventId
}

export default async function Page() {
  const pretixEventId = await getPretixEvent()

  const pretixEventUrl = `${process.env.NEXT_PUBLIC_PRETIX_URL}/${process.env.NEXT_PUBLIC_PRETIX_ORGANIZER}/${pretixEventId}/`

  return (
    <section className="container mx-auto max-w-3xl">
      <link
        rel="stylesheet"
        type="text/css"
        href={`${pretixEventUrl}widget/v2.css`}
        crossOrigin="anonymous"
      />
      <script
        type="text/javascript"
        src={`${process.env.NEXT_PUBLIC_PRETIX_URL}/widget/v2.de.js`}
        async
        crossOrigin="anonymous"
      />
      <div
        className="p-6"
        dangerouslySetInnerHTML={{
          __html: `<div class="pretix-widget-compat" event="${pretixEventUrl}"></div>
<noscript>
	<div class="pretix-widget">
		<div class="pretix-widget-info-message">
      JavaScript ist in Ihrem Browser deaktiviert. Um unseren Ticketshop ohne JavaScript aufzurufen, klicken Sie bitte <a target="_blank" rel="noopener" href="${process.env.NEXT_PUBLIC_PRETIX_URL}">hier</a>.
		</div>
	</div>
</noscript>`,
        }}
      />
    </section>
  )
}
