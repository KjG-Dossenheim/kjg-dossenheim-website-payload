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

  // Fetch all events (for the selector) and all floors (for the plan) in parallel
  const payloadInst = await getPayload({ config })
  const [eventsResult, floorsResult] = await Promise.all([
    payloadInst.find({
      collection: 'sommerfreizeitEvents',
      limit: 0,
      overrideAccess: true,
      sort: '-startDate',
    }),
    payloadInst.find({
      collection: 'sommerfreizeitFloors',
      limit: 0,
      overrideAccess: true,
    }),
  ])

  // Default selection: the event linked in the Sommerfreizeit landing page global
  let defaultEventId: string | null = null
  try {
    const landingPage = await payloadInst.findGlobal({
      slug: 'sommerfreizeitLandingPage',
      select: { freizeit: true },
      overrideAccess: true,
    })
    defaultEventId =
      typeof landingPage?.freizeit === 'string'
        ? landingPage.freizeit
        : (landingPage?.freizeit?.id ?? null)
  } catch {
    // Global not configured yet — fall back to no default selection
  }

  const events = eventsResult.docs.map((e: any) => ({
    id: e.id,
    name: e.name,
    startDate: e.startDate,
  }))

  const floors = floorsResult.docs.map((f: any) => ({
    id: f.id,
    name: f.name,
    gender: f.gender === 'male' || f.gender === 'female' ? f.gender : null,
    eventId: typeof f.freizeit === 'string' ? f.freizeit : (f.freizeit?.id ?? ''),
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
          <RaumplanClient events={events} floors={floors} defaultEventId={defaultEventId} />
        </TooltipProvider>
      </Gutter>
    </DefaultTemplate>
  )
}
