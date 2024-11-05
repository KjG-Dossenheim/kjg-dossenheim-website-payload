import React from 'react'

export default function CoverBlockServer({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className='max-w-5xl py-20'>
        <h1 className='text-3xl font-bold'>{title}</h1>
        <h2 className="text-xl">{subtitle}</h2>
    </div>
  )
}
