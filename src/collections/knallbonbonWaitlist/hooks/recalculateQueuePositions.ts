import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

/**
 * Recalculate queue positions for all pending entries after changes
 * This ensures FIFO ordering is maintained based on createdAt timestamp
 */
export const recalculateQueuePositionsAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  const eventId = typeof doc.event === 'string' ? doc.event : doc.event?.id

  if (!eventId) return doc

  await recalculatePositionsForEvent(req, eventId)
  return doc
}

/**
 * Recalculate queue positions after entry deletion
 */
export const recalculateQueuePositionsAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  const eventId = typeof doc.event === 'string' ? doc.event : doc.event?.id

  if (!eventId) return doc

  await recalculatePositionsForEvent(req, eventId)
  return doc
}

/**
 * Recalculate queue positions for all pending entries in an event
 *
 * Called after any change to waitlist entries to ensure FIFO ordering
 * is maintained. Positions are based on createdAt timestamp.
 *
 * @param req - Payload request object
 * @param eventId - Event ID to recalculate positions for
 */
async function recalculatePositionsForEvent(req: PayloadRequest, eventId: string): Promise<void> {
  try {
    // Fetch all pending waitlist entries for this event, ordered by createdAt (FIFO)
    const entries = await req.payload.find({
      collection: 'knallbonbonWaitlist',
      where: {
        and: [
          { event: { equals: eventId } },
          { status: { equals: 'pending' } },
        ],
      },
      sort: 'createdAt',
      limit: 1000,
    })

    // Update queue positions (1-indexed)
    for (let i = 0; i < entries.docs.length; i++) {
      const entry = entries.docs[i]
      const newPosition = i + 1

      // Only update if position has changed (performance optimization)
      if (entry.queuePosition !== newPosition) {
        await req.payload.update({
          collection: 'knallbonbonWaitlist',
          id: entry.id,
          data: { queuePosition: newPosition },
        })
      }
    }

    req.payload.logger.info(
      `[Waitlist] Recalculated queue positions for event ${eventId}: ${entries.docs.length} pending entries`,
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[Waitlist] Error recalculating queue positions for event ${eventId}: ${errorMessage}`,
    )
  }
}
