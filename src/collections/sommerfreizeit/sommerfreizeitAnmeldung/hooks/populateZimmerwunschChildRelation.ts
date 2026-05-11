import type { CollectionBeforeChangeHook } from 'payload'

export const populateZimmerwunschChildRelation: CollectionBeforeChangeHook = async ({
  data,
  req,
  context,
}) => {
  // Skip if no zimmerwunsch array or if context flag is set
  if (!data?.zimmerwunsch || context?.skipZimmerwunschSync) {
    return data
  }

  // Process each room preference item to populate childRelation
  const updatedZimmerwunsch = await Promise.all(
    data.zimmerwunsch.map(async (item: Record<string, unknown>) => {
      if (!item?.firstName) {
        return item
      }
      try {
        // Build query where clause based on available name parts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let where: any
        if (item?.lastName) {
          where = {
            AND: [{ firstName: { equals: item.firstName } }, { lastName: { equals: item.lastName } }],
          }
        } else {
          where = {
            firstName: { equals: item.firstName },
          }
        }

        const { docs: children } = await req.payload.find({
          collection: 'sommerfreizeitAnmeldung',
          where,
          limit: 1,
          depth: 0,
        })
        // Set childRelation to matched child ID, or null if not found
        return {
          ...item,
          childRelation: children && children.length > 0 ? children[0].id : null,
        }
      } catch (err) {
        // Log warning but don't fail the entire operation
        req.payload.logger.warn({
          msg: `Failed to populate childRelation for room preference name "${item?.firstName} ${item?.lastName ?? ''}". Error: ${err instanceof Error ? err.message : String(err)}`,
          err,
        })
        // Return item unchanged if error occurs
        return item
      }
    }),
  )

  return {
    ...data,
    zimmerwunsch: updatedZimmerwunsch,
  }
}
