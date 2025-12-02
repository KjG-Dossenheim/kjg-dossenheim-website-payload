import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import { ChildrenListClient } from './ChildrenListClient'

export async function KnallbonbonChildrenView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user, payload },
  } = initPageResult

  // Authentication check
  if (!user) {
    redirect('/admin/login?redirect=/admin/collections/knallbonbonRegistration/children')
  }

  // Get event ID from URL search params
  const eventId = searchParams?.event as string | undefined

  // Require event parameter
  if (!eventId) {
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
        <Gutter>
          <h1 className="render-title">Knallbonbon Kinderliste</h1>
          <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-500)' }}>
            Bitte wählen Sie eine Veranstaltung aus, indem Sie den URL-Parameter ?event=EVENT_ID
            hinzufügen.
          </p>
        </Gutter>
      </DefaultTemplate>
    )
  }

  // Fetch registrations for specific event
  const registrations = await payload.find({
    collection: 'knallbonbonRegistration',
    limit: 1000,
    depth: 1,
    where: {
      event: {
        equals: eventId,
      },
    },
  })

  // Fetch the specific event
  const events = await payload.find({
    collection: 'knallbonbonEvents',
    limit: 100,
    depth: 0,
    where: {
      id: {
        equals: eventId,
      },
    },
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
      <Gutter>
        <h1 className="render-title">Knallbonbon Kinderliste</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-500)' }}>
          Alle angemeldeten Kinder nach Veranstaltung gruppiert
        </p>
      </Gutter>
      <ChildrenListClient registrations={registrations.docs} events={events.docs} />
    </DefaultTemplate>
  )
}

export default KnallbonbonChildrenView
