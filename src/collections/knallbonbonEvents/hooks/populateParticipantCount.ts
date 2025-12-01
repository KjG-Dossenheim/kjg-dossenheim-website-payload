import type { CollectionBeforeChangeHook } from 'payload'

export const populateParticipantCount: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  // Only update participant count for existing events (update operation)
  // For new events (create operation), there are no registrations yet
  if (operation === 'update' && data && originalDoc?.id) {
    const eventId = originalDoc.id
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

    console.log(`Updating participant count for event ${eventId}: ${totalChildren} children across ${registrations.totalDocs} registrations`)
    data.participantCount = totalChildren

    // Check if event is full
    if (data.maxParticipants && totalChildren >= data.maxParticipants) {
      data.isFull = true
      console.log(`Event ${eventId} is now full (${totalChildren}/${data.maxParticipants})`)
    } else {
      data.isFull = false
    }
  } else if (operation === 'create') {
    // For new events, set participant count to 0
    data.participantCount = 0
    data.isFull = false
    console.log('Creating new event with participant count: 0')
  }
  return data
}
