import type { CollectionAfterChangeHook } from 'payload'

export const syncAnmeldungenAfterChange: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.skipChildAnmeldungSync) {
    return doc
  }

  if (!doc?.id) {
    return doc
  }

  const registrations = await req.payload.find({
    collection: 'sommerfreizeitAnmeldung',
    where: {
      child: {
        equals: doc.id,
      },
    },
    depth: 0,
    limit: 1000,
    pagination: false,
  })

  await Promise.all(
    registrations.docs.map(async (registration) => {
      await req.payload.update({
        collection: 'sommerfreizeitAnmeldung',
        id: registration.id,
        data: {
          firstName: doc.firstName ?? null,
          lastName: doc.lastName ?? null,
          birthDate: doc.dateOfBirth ?? null,
        },
        context: {
          skipChildAnmeldungSync: true,
        },
      })
    }),
  )

  return doc
}