import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { redirect } from 'next/navigation'
import { EmailPreviewClient } from './EmailPreviewClient'

export async function PreviewEmailView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user },
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/email-preview')
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
      <Gutter>
        <h1>Email Template Preview</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Preview and test your email templates with sample data
        </p>
        <EmailPreviewClient />
      </Gutter>
    </DefaultTemplate>
  )
}

export default PreviewEmailView
