import { redirect } from 'next/navigation'

import { getSommerfreizeitPage } from '@/utilities/sommerfreizeitPage'

export const revalidate = 600

async function getPretixEvent() {
  const data = await getSommerfreizeitPage()

  if (data.mode !== 'event') {
    redirect('/sommerfreizeit')
  }

  if (!data.event.pretixEventId) {
    throw new Error('Die verknuepfte Sommerfreizeit hat keine Pretix Event ID.')
  }

  return data.event.pretixEventId
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
