import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'

import { ChildEditForm } from './ChildEditForm'
import { Button } from '@/components/ui/button'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'

function toDateInputValue(value: string) {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

export default async function EditChildPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (!user) {
    const returnTo = encodeURIComponent(`/sommerfreizeit/account/kinder/${childId}`)
    redirect(`/sommerfreizeit/login?returnTo=${returnTo}`)
  }

  try {
    const child = await payload.findByID({
      collection: 'sommerfreizeitChild',
      id: childId,
      depth: 0,
      select: {
        id: true,
        parent: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
      },
    })

    const parentId = typeof child.parent === 'string' ? child.parent : child.parent?.id

    if (!parentId || parentId !== user.id) {
      return notFound()
    }

    return (
      <div className="container mx-auto space-y-6 p-6">
        <ChildEditForm
          childId={child.id}
          initialData={{
            firstName: child.firstName,
            lastName: child.lastName,
            dateOfBirth: toDateInputValue(child.dateOfBirth ?? ''),
            gender: child.gender ?? undefined,
          }}
        />
      </div>
    )
  } catch {
    return notFound()
  }
}
