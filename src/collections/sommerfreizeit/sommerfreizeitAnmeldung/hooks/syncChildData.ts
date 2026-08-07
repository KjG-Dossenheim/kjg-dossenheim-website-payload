import type { CollectionBeforeChangeHook } from 'payload'

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

export const syncChildDataBeforeChange: CollectionBeforeChangeHook = async ({ data, originalDoc, req, context }) => {
  if (!data || context?.skipChildAnmeldungSync) {
    return data
  }

  const childValue = data.child ?? originalDoc?.child
  const childId = resolveRelationshipId(childValue)

  if (!childId) {
    return data
  }

  let child: {
    firstName?: string | null
    lastName?: string | null
    dateOfBirth?: string | null
    gender?: string | null
  }

  if (
    childValue &&
    typeof childValue === 'object' &&
    'firstName' in childValue &&
    'lastName' in childValue
  ) {
    child = childValue as typeof child
  } else {
    try {
      child = await req.payload.findByID({
        collection: 'sommerfreizeitChild',
        id: childId,
        depth: 0,
        overrideAccess: true,
        req,
      })
    } catch (err) {
      req.payload.logger.error({
        msg: `Failed to fetch child ${childId} for Anmeldung sync`,
        err,
      })
      return data
    }
  }

  data.firstName = child.firstName ?? null
  data.lastName = child.lastName ?? null
  data.dateOfBirth = child.dateOfBirth ?? null
  data.gender = child.gender ?? null

  return data
}