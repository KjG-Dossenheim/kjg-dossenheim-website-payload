'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

type MoveToWaitlistResult = {
  success: boolean
  error?: string
  waitlistId?: string
}

export async function moveRegistrationToWaitlist(
  registrationId: string,
): Promise<MoveToWaitlistResult> {
  try {
    const payload = await getPayload({ config })

    // Fetch the registration document
    const registration = await payload.findByID({
      collection: 'knallbonbonRegistration',
      id: registrationId,
    })

    if (!registration) {
      return { success: false, error: 'Anmeldung nicht gefunden' }
    }

    // Get event details
    const eventId = typeof registration.event === 'string'
      ? registration.event
      : registration.event.id

    const event = await payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    if (!event) {
      return { success: false, error: 'Veranstaltung nicht gefunden' }
    }

    // Calculate parent name
    const parentName = `${registration.firstName} ${registration.lastName}`.trim()

    // Map children data from registration to waitlist format
    const children = registration.child?.map((child) => ({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth,
      age: child.age,
      gender: child.gender,
      pickupInfo: child.pickupInfo,
      photoConsent: child.photoConsent || false,
      healthInfo: child.healthInfo || '',
    })) || []

    // Get current highest queue position for this event
    const existingWaitlistEntries = await payload.find({
      collection: 'knallbonbonWaitlist',
      where: {
        event: {
          equals: eventId,
        },
      },
      sort: '-queuePosition',
      limit: 1,
    })

    const nextQueuePosition = existingWaitlistEntries.docs.length > 0
      ? (existingWaitlistEntries.docs[0].queuePosition || 0) + 1
      : 1

    // Create waitlist entry
    const waitlistEntry = await payload.create({
      collection: 'knallbonbonWaitlist',
      data: {
        event: eventId,
        parentName,
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        phone: registration.phone,
        address: registration.address || '',
        postalCode: registration.postalCode || '',
        city: registration.city || '',
        children,
        childrenCount: children.length,
        status: 'pending',
        queuePosition: nextQueuePosition,
      },
    })

    // Delete the registration
    await payload.delete({
      collection: 'knallbonbonRegistration',
      id: registrationId,
    })

    return {
      success: true,
      waitlistId: String(waitlistEntry.id)
    }
  } catch (error) {
    console.error('Error moving registration to waitlist:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Verschieben auf die Warteliste',
    }
  }
}
