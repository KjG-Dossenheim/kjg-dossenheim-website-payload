import type { CollectionAfterChangeHook } from 'payload'
import type { SommerfreizeitOrder } from '@/payload-types'

export const syncPretixStatus: CollectionAfterChangeHook = async ({ data, req }) => {
  if (req.context?.skipPretixStatusSync) {
    return data
  }

  if (!data || !data.pretixOrderCode) {
    return data
  }

  const pretixOrderCode = String(data.pretixOrderCode).trim().toUpperCase()

  if (!pretixOrderCode) {
    return data
  }

  const orders = await req.payload.find({
    collection: 'sommerfreizeitOrders',
    where: {
      orderCode: {
        equals: pretixOrderCode,
      },
    },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  const order = orders.docs[0] as { status?: SommerfreizeitOrder['status'] } | undefined
  const pretixStatus = order?.status

  if (!pretixStatus || pretixStatus === data.pretixStatus) {
    return data
  }

  await req.payload.update({
    collection: 'sommerfreizeitAnmeldung',
    id: data.id,
    data: {
      pretixStatus,
    },
    context: {
      skipPretixStatusSync: true,
    },
    depth: 0,
    draft: false,
    overrideAccess: true,
  })

  return data
}