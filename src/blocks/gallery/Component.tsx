import React from 'react'
import dynamic from 'next/dynamic'

const GalleryClient = dynamic(
  () => import('./Component.Client').then((mod) => ({ default: mod.GalleryClient })),
  {
    loading: () => (
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 animate-pulse rounded bg-gray-200" />
          <div className="h-40 animate-pulse rounded bg-gray-200" />
          <div className="h-40 animate-pulse rounded bg-gray-200" />
          <div className="h-40 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    ),
  },
)

export default function GalleryBlockServer({
  images = [],
  className = '',
}: {
  images?: Array<{ url: string; alt: string }>
  className?: string
}) {
  return (
    <div className={className}>
      <GalleryClient images={images} className={className} />
    </div>
  )
}

export type GalleryBlockProps = {
  images?: Array<{ url: string; alt: string }>
  blockType: 'gallery'
  className?: string
}
