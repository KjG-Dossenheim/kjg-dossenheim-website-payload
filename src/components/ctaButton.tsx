'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CtaButton({ cta }: { cta: { link: string; title: string } }) {
  return (
    <Button asChild className="hidden md:flex">
      <Link href={cta.link}>{cta.title}</Link>
    </Button>
  )
}
