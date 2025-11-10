import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { redirect } from 'next/navigation'
import type { Header } from '@/payload-types'
import { Settings } from 'lucide-react'
import { HeaderForm } from './HeaderForm'

export async function SettingsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const {
    req: { user, payload },
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/knallbonbon')
  }

  // Fetch the Header global data
  const headerData = (await payload.findGlobal({
    slug: 'header',
  })) as Header

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
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={32} />
          Einstellungen
        </h1>

        {/* Header Section */}
        <div
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            backgroundColor: 'var(--theme-elevation-50)',
            borderRadius: '0.5rem',
          }}
        >
          <HeaderForm initialData={headerData} />
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}

export default SettingsView
