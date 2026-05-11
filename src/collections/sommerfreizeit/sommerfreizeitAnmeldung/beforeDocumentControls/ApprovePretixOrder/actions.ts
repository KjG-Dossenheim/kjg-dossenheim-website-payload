'use server'

import { getRequiredEnv } from '@/utilities/env'

type ApprovePretixOrderResult = {
  success: boolean
  message: string
}

function buildPretixApprovalMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Die Bestellung kann nicht freigegeben werden.'
    case 401:
      return 'Pretix-Authentifizierung fehlgeschlagen.'
    case 403:
      return 'Kein Zugriff auf Organizer, Event oder Bestellung.'
    case 404:
      return 'Die Bestellung wurde nicht gefunden.'
    case 409:
      return 'Pretix ist gerade gesperrt. Bitte kurz erneut versuchen.'
    default:
      return `Pretix meldete einen Fehler (${status}).`
  }
}

export async function approvePretixOrder(args: {
  pretixEventID: string
  pretixOrderCode: string
}): Promise<ApprovePretixOrderResult> {
  try {
    const pretixOrganizer = getRequiredEnv('NEXT_PUBLIC_PRETIX_ORGANIZER')
    const pretixToken = getRequiredEnv('PRETIX_API_TOKEN')
    const pretixBaseUrl = (process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu').trim()

    const endpoint = new URL(
      `/api/v1/organizers/${encodeURIComponent(pretixOrganizer)}/events/${encodeURIComponent(args.pretixEventID)}/orders/${encodeURIComponent(args.pretixOrderCode.trim().toUpperCase())}/approve/`,
      pretixBaseUrl,
    )

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/javascript',
        Authorization: `Token ${pretixToken}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        success: false,
        message: buildPretixApprovalMessage(response.status),
      }
    }

    return {
      success: true,
      message: 'Bestellung erfolgreich freigegeben.',
    }
  } catch (error) {
    console.error('Failed to approve Pretix order:', error)

    return {
      success: false,
      message:
        error instanceof Error && error.message.startsWith('ENV_MISSING:')
          ? 'Pretix-Konfiguration nicht verfügbar.'
          : 'Die Bestellung konnte nicht freigegeben werden.',
    }
  }
}