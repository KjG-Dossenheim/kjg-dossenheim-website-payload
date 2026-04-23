import type { CollectionBeforeDeleteHook } from 'payload'

type RelationshipValue =
  | string
  | number
  | {
    id?: string | number
  }
  | null
  | undefined

const resolveRelationshipId = (value: RelationshipValue): string | null => {
  if (!value) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if ('id' in value && value.id !== undefined) {
    return String(value.id)
  }

  return null
}

export const cascadeDeleteAnmeldungenBeforeDelete: CollectionBeforeDeleteHook = async ({
  req,
  id,
}) => {
  const childId = resolveRelationshipId(id)

  if (!childId) {
    return
  }

  const registrations = await req.payload.find({
    collection: 'sommerfreizeitAnmeldung',
    where: {
      child: {
        equals: childId,
      },
    },
    depth: 0,
    limit: 500,
    pagination: false,
  })

  for (const registration of registrations.docs) {
    await req.payload.delete({
      collection: 'sommerfreizeitAnmeldung',
      id: registration.id,
      context: {
        skipChildAnmeldungSync: true,
      },
    })
  }
}
