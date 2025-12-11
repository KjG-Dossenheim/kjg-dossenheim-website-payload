import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { promoteFromWaitlist } from '@/collections/knallbonbonWaitlist/hooks/promoteFromWaitlist'

/**
 * Hook to update the event's participantCount after a registration is created or updated
 */
export const updateEventParticipantCountAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Get the event ID from the registration
  const eventId = typeof doc.event === 'object' ? doc.event.id : doc.event

  if (!eventId) {
    console.warn('No event ID found in registration, skipping participant count update')
    return doc
  }

  try {
    // Fetch all registrations for this event (excluding waitlist)
    const registrations = await req.payload.find({
      collection: 'knallbonbonRegistration',
      where: {
        and: [
          {
            event: {
              equals: eventId,
            },
          },
          {
            isWaitlist: {
              not_equals: true,
            },
          },
        ],
      },
      limit: 1000, // Fetch all registrations to count children
    })

    // Count total number of children across all registrations (excluding waitlist)
    const totalChildren = registrations.docs.reduce((total, registration) => {
      return total + (registration.child?.length || 0)
    }, 0)

    // Fetch the event to get maxParticipants
    const event = await req.payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    // Check if event is full
    const isFull = event.maxParticipants ? totalChildren >= event.maxParticipants : false

    // Update the event's participantCount and isFull
    await req.payload.update({
      collection: 'knallbonbonEvents',
      id: eventId,
      data: {
        participantCount: totalChildren,
        isFull,
      },
    })

    console.log(
      `Updated participant count for event ${eventId}: ${totalChildren} children across ${registrations.totalDocs} registrations (${operation})${isFull ? ' - Event is now full!' : ''}`,
    )

    // Check if waitlist promotion should be triggered
    if (!isFull && event.maxParticipants) {
      console.log('Event has available spots, checking waitlist for promotion...')
      await promoteFromWaitlist(req, eventId)
    }
  } catch (error) {
    console.error('Failed to update event participant count:', error)
  }

  return doc
}

/**
 * Hook to update the event's participantCount after a registration is deleted
 */
export const updateEventParticipantCountAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  // Get the event ID from the deleted registration
  const eventId = typeof doc.event === 'object' ? doc.event.id : doc.event

  if (!eventId) {
    console.warn('No event ID found in deleted registration, skipping participant count update')
    return doc
  }

  try {
    // Fetch all remaining registrations for this event (excluding waitlist)
    const registrations = await req.payload.find({
      collection: 'knallbonbonRegistration',
      where: {
        and: [
          {
            event: {
              equals: eventId,
            },
          },
          {
            isWaitlist: {
              not_equals: true,
            },
          },
        ],
      },
      limit: 1000, // Fetch all registrations to count children
    })

    // Count total number of children across all registrations (excluding waitlist)
    const totalChildren = registrations.docs.reduce((total, registration) => {
      return total + (registration.child?.length || 0)
    }, 0)

    // Fetch the event to get maxParticipants
    const event = await req.payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    // Check if event is full
    const isFull = event.maxParticipants ? totalChildren >= event.maxParticipants : false

    // Update the event's participantCount and isFull
    await req.payload.update({
      collection: 'knallbonbonEvents',
      id: eventId,
      data: {
        participantCount: totalChildren,
        isFull,
      },
    })

    console.log(
      `Updated participant count for event ${eventId} after deletion: ${totalChildren} children across ${registrations.totalDocs} registrations${isFull ? ' - Event is now full!' : ''}`,
    )

    // Check if waitlist promotion should be triggered
    if (!isFull && event.maxParticipants) {
      console.log('Event has available spots after deletion, checking waitlist for promotion...')
      await promoteFromWaitlist(req, eventId)
    }
  } catch (error) {
    console.error('Failed to update event participant count after deletion:', error)
  }

  return doc
}
