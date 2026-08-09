import type { CollectionBeforeChangeHook } from 'payload'

interface GenderComposition {
  male: number
  female: number
  diverse: number
}

/**
 * Compute and store gender composition on the room.
 * Also validates that male+female aren't mixed (unless pre-existing).
 *
 * Uses a single registration query and denormalizes the result into
 * the `genderComposition` JSON field on the room for O(1) reads elsewhere.
 *
 * Skip by setting `context.skipGenderValidation = true` (used when the
 * caller has already validated, e.g. saveRoomAssignments action).
 */
export const validateGenderHomogeneity: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  context,
}) => {
  // Skip if caller already validated
  if (context?.skipGenderValidation) return data

  if (!data || data.occupants === undefined) return data

  const newOccupantIds: string[] = (data.occupants ?? [])
    .map((o: any) => (typeof o === 'string' ? o : o?.id ?? o))
    .filter(Boolean)

  // No occupants → clear composition
  if (newOccupantIds.length === 0) {
    data.genderComposition = { male: 0, female: 0, diverse: 0 }
    return data
  }

  // Fetch genders in a single query
  const registrations = await req.payload.find({
    collection: 'sommerfreizeitAnmeldung',
    where: { id: { in: newOccupantIds } },
    limit: 0,
    overrideAccess: true,
  })

  const composition: GenderComposition = { male: 0, female: 0, diverse: 0 }
  for (const r of registrations.docs) {
    const g = (r as any).gender ?? 'diverse'
    composition[g as keyof GenderComposition]++
  }

  // Always store the computed composition
  data.genderComposition = composition

  // Validate: no new cross-gender mixing
  if (composition.male > 0 && composition.female > 0) {
    // Check if this was pre-existing via the stored composition on the original doc
    const prevComp = (originalDoc as any)?.genderComposition as
      | GenderComposition
      | undefined
    if (prevComp && prevComp.male > 0 && prevComp.female > 0) {
      // Already mixed before — warn but allow
      req.payload.logger.warn(
        `Room ${originalDoc?.id ?? 'unknown'} already has mixed-gender occupants — update allowed but should be fixed manually.`,
      )
      return data
    }
    // New cross-gender mixing — block
    throw new Error(
      'Gemischte Belegung nicht erlaubt: Dieses Zimmer würde sowohl Jungen als auch Mädchen enthalten. Bitte weisen Sie Kinder nur geschlechtergetrennt zu.',
    )
  }

  return data
}
