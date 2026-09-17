import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ExportClient } from './ExportClient'
import type { ExportEventOption } from './types'

export default async function SommerfreizeitExportView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user, payload },
    permissions,
    visibleEntities,
    locale,
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/sommerfreizeit/export')
  }

  const payloadInst = await getPayload({ config })

  const eventsResult = await payloadInst.find({
    collection: 'sommerfreizeitEvents',
    limit: 0,
    overrideAccess: true,
    sort: '-startDate',
    select: { name: true, startDate: true },
  })

  // Default selection: the event linked in the Sommerfreizeit settings global
  let defaultEventId: string | null = null

  try {
    const settings = await payloadInst.findGlobal({
      slug: 'sommerfreizeitSettings',
      select: { freizeit: true },
      overrideAccess: true,
    })

    defaultEventId =
      typeof settings?.freizeit === 'string' ? settings.freizeit : (settings?.freizeit?.id ?? null)
  } catch {
    // Global not configured yet — fall back to the first event
    defaultEventId = null
  }

  const events: ExportEventOption[] = eventsResult.docs.map((event) => ({
    id: event.id,
    name: event.name,
    startDate: event.startDate,
  }))

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <ExportClient events={events} defaultEventId={defaultEventId} />
      </Gutter>
    </DefaultTemplate>
  )
}
