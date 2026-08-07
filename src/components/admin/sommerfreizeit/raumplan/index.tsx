import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RaumplanClient } from './RaumplanClient'
import { TooltipProvider } from '@/components/ui/tooltip'

export default async function RaumplanView({
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
    redirect('/admin/login?redirect=/admin/sommerfreizeit/raumplan')
  }

  // Fetch all events for the selector
  const payloadInst = await getPayload({ config })
  const eventsResult = await payloadInst.find({
    collection: 'sommerfreizeitEvents',
    limit: 0,
    overrideAccess: true,
    sort: '-startDate',
  })

  const events = eventsResult.docs.map((e: any) => ({
    id: e.id,
    name: e.name,
    startDate: e.startDate,
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
        <TooltipProvider>
          <RaumplanClient events={events} />
        </TooltipProvider>
      </Gutter>
    </DefaultTemplate>
  )
}
