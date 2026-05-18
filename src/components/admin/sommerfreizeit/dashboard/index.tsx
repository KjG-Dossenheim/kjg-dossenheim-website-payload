import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type {
  SommerfreizeitAnmeldung,
  SommerfreizeitChild,
  SommerfreizeitEvent,
  SommerfreizeitFeedback,
  SommerfreizeitOrder,
  SommerfreizeitUser,
} from '@/payload-types'

type CollectionStat = {
  label: string
  value: string
  href: string
  description: string
}

const numberFormatter = new Intl.NumberFormat('de-DE')

function formatDate(value?: string | null) {
  if (!value) {
    return 'Keine Angabe'
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function resolveEventTitle(event?: string | SommerfreizeitEvent | null) {
  if (!event) {
    return 'Keine Veranstaltung'
  }

  if (typeof event === 'string') {
    return event
  }

  return event.name
}

function resolveChildName(child?: string | SommerfreizeitChild | null) {
  if (!child) {
    return 'Unbekanntes Kind'
  }

  if (typeof child === 'string') {
    return child
  }

  return [child.firstName, child.lastName].filter(Boolean).join(' ') || 'Unbekanntes Kind'
}

function resolveUserName(user?: string | SommerfreizeitUser | null) {
  if (!user) {
    return 'Unbekanntes Konto'
  }

  if (typeof user === 'string') {
    return user
  }

  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const toneClasses = {
    neutral: 'bg-(--theme-elevation-100) text-(--theme-text-100)',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  } as const

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {label}
    </span>
  )
}

function SectionCard({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link
          className="text-sm font-medium text-(--theme-text-500) underline-offset-4 hover:underline"
          href={href}
        >
          Alle öffnen
        </Link>
      </div>
      {children}
    </section>
  )
}

function StatCard({ label, value, description, href }: CollectionStat) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-(--theme-elevation-250)"
    >
      <div className="text-sm text-(--theme-text-500)">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <p className="mt-2 text-sm text-(--theme-text-500)">{description}</p>
      <div className="mt-4 text-sm font-medium text-(--theme-text-100) opacity-80 group-hover:opacity-100">
        Öffnen
      </div>
    </Link>
  )
}

export async function SommerfreizeitDashboardView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user, payload },
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/sommerfreizeit')
  }

  const [
    eventsResult,
    registrationsResult,
    childrenResult,
    usersResult,
    ordersResult,
    feedbackResult,
    roomsResult,
  ] = await Promise.all([
    payload.find({
      collection: 'sommerfreizeitEvents',
      depth: 0,
      limit: 5,
      sort: 'startDate',
    }),
    payload.find({
      collection: 'sommerfreizeitAnmeldung',
      depth: 1,
      limit: 5,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'sommerfreizeitChild',
      depth: 0,
      limit: 1,
    }),
    payload.find({
      collection: 'sommerfreizeitUsers',
      depth: 0,
      limit: 1,
    }),
    payload.find({
      collection: 'sommerfreizeitOrders',
      depth: 0,
      limit: 5,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'sommerfreizeitFeedback',
      depth: 0,
      limit: 5,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'sommerfreizeitRooms',
      depth: 0,
      limit: 1,
    }),
  ])

  const upcomingEvent = eventsResult.docs[0] as SommerfreizeitEvent | undefined
  const recentRegistrations = registrationsResult.docs as SommerfreizeitAnmeldung[]
  const recentOrders = ordersResult.docs as SommerfreizeitOrder[]
  const recentFeedback = feedbackResult.docs as SommerfreizeitFeedback[]

  const stats: CollectionStat[] = [
    {
      label: 'Freizeiten',
      value: numberFormatter.format(eventsResult.totalDocs ?? 0),
      description: upcomingEvent
        ? `Nächste Freizeit: ${upcomingEvent.name}`
        : 'Noch keine Freizeit angelegt',
      href: '/admin/collections/sommerfreizeitEvents',
    },
    {
      label: 'Anmeldungen',
      value: numberFormatter.format(registrationsResult.totalDocs ?? 0),
      description: 'Alle erfassten Sommerfreizeit-Anmeldungen',
      href: '/admin/collections/sommerfreizeitAnmeldung',
    },
    {
      label: 'Kinder',
      value: numberFormatter.format(childrenResult.totalDocs ?? 0),
      description: 'Verknüpfte Kinderprofile',
      href: '/admin/collections/sommerfreizeitChild',
    },
    {
      label: 'Konten',
      value: numberFormatter.format(usersResult.totalDocs ?? 0),
      description: 'Sommerfreizeit-Benutzerkonten',
      href: '/admin/collections/sommerfreizeitUsers',
    },
    {
      label: 'Pretix Bestellungen',
      value: numberFormatter.format(ordersResult.totalDocs ?? 0),
      description: 'Importierte Bestellungen aus Pretix',
      href: '/admin/collections/sommerfreizeitOrders',
    },
    {
      label: 'Feedback',
      value: numberFormatter.format(feedbackResult.totalDocs ?? 0),
      description: 'Eingegangene Rückmeldungen',
      href: '/admin/collections/sommerfreizeitFeedback',
    },
    {
      label: 'Zimmer',
      value: numberFormatter.format(roomsResult.totalDocs ?? 0),
      description: 'Verfügbare Zimmer und Belegungen',
      href: '/admin/collections/sommerfreizeitRooms',
    },
  ]

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
      <Gutter className="py-6">
        <div className="mb-8 rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-medium tracking-[0.2em] text-(--theme-text-500) uppercase">
                Sommerfreizeit
              </p>
              <h1 className="render-title text-4xl font-semibold tracking-tight">Dashboard</h1>
              <p className="max-w-2xl text-base text-(--theme-text-500)">
                Überblick über Freizeiten, Anmeldungen, Pretix-Bestellungen, Zimmer und
                Rückmeldungen. Hier springen Sie direkt in die wichtigsten Sommerfreizeit-Bereiche.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/collections/sommerfreizeitAnmeldung"
                className="rounded-full border border-(--theme-elevation-200) px-4 py-2 text-sm font-medium hover:bg-(--theme-elevation-100)"
              >
                Anmeldungen öffnen
              </Link>
              <Link
                href="/admin/collections/sommerfreizeitOrders"
                className="rounded-full border border-(--theme-elevation-200) px-4 py-2 text-sm font-medium hover:bg-(--theme-elevation-100)"
              >
                Pretix-Bestellungen
              </Link>
              <Link
                href="/admin/collections/sommerfreizeitEvents"
                className="rounded-full border border-(--theme-elevation-200) px-4 py-2 text-sm font-medium hover:bg-(--theme-elevation-100)"
              >
                Freizeiten verwalten
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-(--theme-elevation-100) px-4 py-3">
              <div className="text-sm text-(--theme-text-500)">Nächste Freizeit</div>
              <div className="mt-1 font-semibold">
                {upcomingEvent ? upcomingEvent.name : 'Keine Freizeit vorhanden'}
              </div>
              <div className="mt-1 text-sm text-(--theme-text-500)">
                {upcomingEvent
                  ? formatDate(upcomingEvent.startDate)
                  : 'Bitte zuerst eine Freizeit anlegen'}
              </div>
            </div>
            <div className="rounded-2xl bg-(--theme-elevation-100) px-4 py-3">
              <div className="text-sm text-(--theme-text-500)">Anmeldungen gesamt</div>
              <div className="mt-1 font-semibold">
                {numberFormatter.format(registrationsResult.totalDocs ?? 0)}
              </div>
              <div className="mt-1 text-sm text-(--theme-text-500)">
                Aktuelle Übersicht aller Datensätze
              </div>
            </div>
            <div className="rounded-2xl bg-(--theme-elevation-100) px-4 py-3">
              <div className="text-sm text-(--theme-text-500)">Offene Bestellungen</div>
              <div className="mt-1 font-semibold">
                {numberFormatter.format(
                  recentOrders.filter((order) => order.status === 'n').length,
                )}
              </div>
              <div className="mt-1 text-sm text-(--theme-text-500)">
                Pending-Status in Pretix-Importen
              </div>
            </div>
            <div className="rounded-2xl bg-(--theme-elevation-100) px-4 py-3">
              <div className="text-sm text-(--theme-text-500)">Feedback-Einträge</div>
              <div className="mt-1 font-semibold">
                {numberFormatter.format(feedbackResult.totalDocs ?? 0)}
              </div>
              <div className="mt-1 text-sm text-(--theme-text-500)">Eingegangene Antworten</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <SectionCard title="Letzte Anmeldungen" href="/admin/collections/sommerfreizeitAnmeldung">
            <div className="space-y-4">
              {recentRegistrations.length === 0 ? (
                <p className="text-sm text-(--theme-text-500)">Noch keine Anmeldungen vorhanden.</p>
              ) : (
                recentRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex flex-col gap-3 rounded-2xl border border-(--theme-elevation-100) bg-(--theme-elevation-0) p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {resolveChildName(registration.child)} ·{' '}
                        {resolveUserName(registration.account)}
                      </div>
                      <div className="mt-1 text-sm text-(--theme-text-500)">
                        {resolveEventTitle(registration.event)} ·{' '}
                        {formatDate(registration.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {registration.pretixStatus === 'p' ? (
                        <StatusPill label="Bezahlt" tone="success" />
                      ) : registration.pretixStatus === 'n' ? (
                        <StatusPill label="Pending" tone="warning" />
                      ) : registration.pretixStatus === 'e' ? (
                        <StatusPill label="Abgelaufen" tone="neutral" />
                      ) : registration.pretixStatus === 'c' ? (
                        <StatusPill label="Storniert" tone="danger" />
                      ) : (
                        <StatusPill label="Ohne Pretix-Status" tone="neutral" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Letzte Pretix-Bestellungen"
            href="/admin/collections/sommerfreizeitOrders"
          >
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-(--theme-text-500)">
                  Noch keine Bestellungen importiert.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-2xl border border-(--theme-elevation-100) bg-(--theme-elevation-0) p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="font-medium">{order.orderCode}</div>
                      <div className="mt-1 text-sm text-(--theme-text-500)">
                        {order.email || 'Keine E-Mail'} ·{' '}
                        {formatDate(order.datetime || order.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill
                        label={
                          order.status === 'p'
                            ? 'Bezahlt'
                            : order.status === 'n'
                              ? 'Pending'
                              : order.status === 'e'
                                ? 'Abgelaufen'
                                : order.status === 'c'
                                  ? 'Storniert'
                                  : 'Unbekannt'
                        }
                        tone={
                          order.status === 'p'
                            ? 'success'
                            : order.status === 'n'
                              ? 'warning'
                              : order.status === 'e'
                                ? 'neutral'
                                : order.status === 'c'
                                  ? 'danger'
                                  : 'neutral'
                        }
                      />
                      <span className="text-sm text-(--theme-text-500)">{order.total}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Nächste Freizeiten" href="/admin/collections/sommerfreizeitEvents">
            <div className="space-y-4">
              {eventsResult.docs.length === 0 ? (
                <p className="text-sm text-(--theme-text-500)">Noch keine Freizeiten angelegt.</p>
              ) : (
                (eventsResult.docs as SommerfreizeitEvent[]).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-(--theme-elevation-100) bg-(--theme-elevation-0) p-4"
                  >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="mt-1 text-sm text-(--theme-text-500)">
                          {event.motto || 'Kein Motto hinterlegt'}
                        </div>
                      </div>
                      <StatusPill label={formatDate(event.startDate)} tone="info" />
                    </div>
                    <div className="mt-3 text-sm text-(--theme-text-500)">
                      {formatDate(event.startDate)} bis {formatDate(event.endDate)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Letzte Rückmeldungen"
            href="/admin/collections/sommerfreizeitFeedback"
          >
            <div className="space-y-4">
              {recentFeedback.length === 0 ? (
                <p className="text-sm text-(--theme-text-500)">Noch kein Feedback eingegangen.</p>
              ) : (
                recentFeedback.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-(--theme-elevation-100) bg-(--theme-elevation-0) p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{entry.rating}/5 Sterne</div>
                      <StatusPill label={`${entry.age} Jahre`} tone="neutral" />
                    </div>
                    <p className="mt-2 text-sm text-(--theme-text-500)">
                      {entry.comments || 'Kein Kommentar hinterlegt'}
                    </p>
                    <div className="mt-2 text-xs text-(--theme-text-500)">
                      {formatDate(entry.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}

export default SommerfreizeitDashboardView
