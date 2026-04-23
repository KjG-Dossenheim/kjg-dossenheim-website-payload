import { getServerSession } from '@delmaredigital/payload-better-auth'
import type { BasePayload } from 'payload'

type SommerfreizeitSessionUser = {
  id: string
}

export async function getSommerfreizeitSessionUser(payload: BasePayload, headers: Headers) {
  const session = await getServerSession<SommerfreizeitSessionUser>(payload, headers)

  if (!session?.user?.id) {
    return null
  }

  try {
    const user = await payload.findByID({
      collection: 'sommerfreizeitUsers',
      id: session.user.id,
      depth: 0,
    })

    if (!user) {
      return null
    }

    return user
  } catch {
    return null
  }
}
