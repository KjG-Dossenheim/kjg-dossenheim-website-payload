import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cleanupExpiredConfirmations } from '@/collections/knallbonbonRegistration/hooks/cleanupExpiredConfirmations'

/**
 * Cron endpoint to cleanup expired waitlist confirmations
 *
 * This endpoint should be called by a cron job (e.g., daily at 1:00 AM)
 *
 * Example cron configuration (using a service like cron-job.org or Vercel Cron):
 * Schedule: 0 1 * * * (every day at 1:00 AM)
 * URL: https://your-domain.com/api/cron/cleanup-expired-confirmations
 *
 * For security, you should add authentication (e.g., check for a secret token)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Starting scheduled cleanup of expired confirmations...')

    const payload = await getPayload({ config })

    // Create a mock request object for the cleanup function
    const mockReq = {
      payload,
      user: null,
      locale: 'de',
      fallbackLocale: 'de',
    } as any

    await cleanupExpiredConfirmations(payload, mockReq)

    return NextResponse.json({
      success: true,
      message: 'Expired confirmations cleanup completed',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in cleanup cron job:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup expired confirmations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
