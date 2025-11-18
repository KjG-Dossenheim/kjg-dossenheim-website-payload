import React from 'react'
import Image from 'next/image'

export default function GalleryBlockServer({
  images,
}: {
  images: Array<{ url: string; alt: string }>
}) {
  return (
    <div>
      {images.map((image, index) => (
        <div key={index}>
          <Image src={image.url} alt={image.alt} width={500} height={500} />
        </div>
      ))}
    </div>
  )
}

export type GalleryBlockProps = {
  images: Array<{ url: string; alt: string }>
  blockType: 'gallery'
}
