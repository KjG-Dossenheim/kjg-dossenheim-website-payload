import config from '@payload-config'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import React, { cache } from 'react'

import type { Page as PageType } from '../../../payload-types'

import { RenderBlocks } from '@/utils/RenderBlocks'

import { notFound } from 'next/navigation'

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const parsedSlug = decodeURIComponent(slug)

  const payload = await getPayloadHMR({ config })

  const result = await payload.find({
    collection: 'pages',
    limit: 1,
    where: {
      slug: {
        equals: parsedSlug,
      },
    },
  })

  return result.docs?.[0] || null
})

export async function generateStaticParams() {
  const payload = await getPayloadHMR({ config })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
  })

  return pages.docs
    ?.filter((doc) => doc.slug !== 'index')
    .map((doc) => ({ slug: doc.slug }))
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug = 'index' } = await params;
  
  let page: PageType | null

  page = await queryPageBySlug({
    slug,
  })

  if (!page) {
    return notFound()
  }

  return (
    <div className="pt-16 pb-24">
      <RenderBlocks blocks={page.layout} />
    </div>
  )
}
