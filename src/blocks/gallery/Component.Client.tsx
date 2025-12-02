'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type Props = {
  images?: Array<{ url: string; alt: string }>
  className?: string
}

export const GalleryClient: React.FC<Props> = ({ images = [], className = '' }) => {
  // Distribute images into 4 columns (round-robin) to mimic a masonry/bento grid
  const columnCount = 4
  const columns: Array<typeof images> = Array.from({ length: columnCount }, () => [])
  images.forEach((img, i) => {
    columns[i % columnCount].push(img)
  })

  return (
    <div className={cn(className, 'grid-col-1 grid gap-4 sm:grid-cols-2 md:grid-cols-4')}>
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="grid gap-4">
          {col.map((image, index) => (
            <div key={`${colIndex}-${index}`} className="rounded-(--radius-base)">
              {/* Using native img to preserve natural aspect ratio without cropping */}
              <Image
                src={image.url}
                alt={image.alt}
                className="h-auto max-w-full"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default GalleryClient
