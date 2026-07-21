import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import { ImportJsonClient } from './ImportJsonClient'
import Link from 'next/link'

export async function ImportJsonView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user },
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/sommerfreizeit/import-json')
  }

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
              <h1 className="render-title text-4xl font-semibold tracking-tight">
                JSON importieren
              </h1>
              <p className="max-w-2xl text-base text-(--theme-text-500)">
                Importiere eine JSON-Datei, die über den &quot;Exportieren&quot;-Button im
                Anmeldeformular exportiert wurde. Die Daten werden in Kinder, Anmeldungen und
                Kontaktdaten eingefügt.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/sommerfreizeit"
                className="rounded-full border border-(--theme-elevation-200) px-4 py-2 text-sm font-medium hover:bg-(--theme-elevation-100)"
              >
                ← Dashboard
              </Link>
              <Link
                href="/admin/collections/sommerfreizeitAnmeldung"
                className="rounded-full border border-(--theme-elevation-200) px-4 py-2 text-sm font-medium hover:bg-(--theme-elevation-100)"
              >
                Anmeldungen
              </Link>
            </div>
          </div>
        </div>

        <ImportJsonClient />
      </Gutter>
    </DefaultTemplate>
  )
}

export default ImportJsonView
