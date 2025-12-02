import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import { WaitlistClient } from './WaitListClient'

export async function WaitlistView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user, payload },
  } = initPageResult

  // Authentication check
  if (!user) {
    redirect('/admin/login?redirect=/admin/collections/knallbonbonRegistration/waitlist')
  }

  const registrations = await payload.find({
    collection: 'knallbonbonRegistration',
    depth: 1,
    where: {
      and: [
        {
          isWaitlist: {
            equals: true,
          },
        },
        ...(searchParams?.event
          ? [
              {
                event: {
                  equals: searchParams.event,
                },
              },
            ]
          : []),
      ],
    },
  })

  const events = await payload.find({
    collection: 'knallbonbonEvents',
  })

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <WaitlistClient
        registrations={registrations.docs}
        events={events.docs}
        initialEventId={
          typeof searchParams?.event === 'string' ? searchParams.event : undefined
        }
      />
    </DefaultTemplate>
  )
}

export default WaitlistView
