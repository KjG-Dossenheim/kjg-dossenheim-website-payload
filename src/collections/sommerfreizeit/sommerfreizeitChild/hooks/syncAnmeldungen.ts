import type { CollectionAfterChangeHook } from 'payload'

export const syncAnmeldungenAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipChildAnmeldungSync) {
    return doc
  }

  if (!doc?.id) {
    return doc
  }

  // Skip sync if identity fields haven't changed
  if (
    previousDoc &&
    doc.firstName === previousDoc.firstName &&
    doc.lastName === previousDoc.lastName &&
    doc.dateOfBirth === previousDoc.dateOfBirth &&
    doc.gender === previousDoc.gender
  ) {
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
    pagination: false,
    overrideAccess: true,
    req,
  })

  const results = await Promise.allSettled(
    registrations.docs.map((registration) =>
      req.payload.update({
        collection: 'sommerfreizeitAnmeldung',
        id: registration.id,
        data: {
          firstName: doc.firstName ?? null,
          lastName: doc.lastName ?? null,
          dateOfBirth: doc.dateOfBirth ?? null,
          gender: doc.gender ?? null,
        },
        context: {
          skipChildAnmeldungSync: true,
        },
        overrideAccess: true,
        req,
      }),
    ),
  )

  for (const result of results) {
    if (result.status === 'rejected') {
      req.payload.logger.error({
        msg: `Failed to sync child data to Anmeldung for child ${doc.id}`,
        err: result.reason,
      })
    }
  }

  return doc
}