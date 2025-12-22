import { type PropsWithChildren } from 'react'
import Link from 'next/link'
import Wortmarke from '@/graphics/logo/Wortmarke'

export function AuthForm({ children }: PropsWithChildren) {
  return (
    <section className="h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <Link href="/">
            <Wortmarke className="max-w-sm min-w-sm px-6" />
          </Link>
          {children}
        </div>
      </div>
    </section>
  )
}
