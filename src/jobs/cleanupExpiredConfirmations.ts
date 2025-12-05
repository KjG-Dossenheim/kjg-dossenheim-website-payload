import { cleanupExpiredConfirmations } from '@/collections/knallbonbonRegistration/hooks/cleanupExpiredConfirmations'

/**
 * Job to cleanup expired waitlist confirmations
 *
 * This job finds and resets expired promotion confirmations, then triggers
 * promotion for the next person in line.
 *
 * To schedule this job to run daily at 1:00 AM, queue it once with a waitUntil parameter:
 *
 * ```typescript
 * // In a server component or API route:
 * import { getPayload } from 'payload'
 * import config from '@payload-config'
 *
 * const payload = await getPayload({ config })
 *
 * // Calculate next 1:00 AM
 * const nextRun = new Date()
 * nextRun.setDate(nextRun.getDate() + 1)
 * nextRun.setHours(1, 0, 0, 0)
 *
 * await payload.jobs.queue({
 *   task: 'cleanupExpiredConfirmations',
 *   input: {},
 *   waitUntil: nextRun,
 * })
 * ```
 *
 * The job will need to be re-queued after each run. For automatic rescheduling,
 * consider using a cron service (Vercel Cron, GitHub Actions, etc.) to call an API
 * endpoint that queues this job.
 */
export const cleanupExpiredConfirmationsJob = {
  slug: 'cleanupExpiredConfirmations',
  interfaceName: 'CleanupExpiredConfirmationsJob',
  handler: async ({ req }: any) => {
    try {
      req.payload.logger.info('Starting scheduled cleanup of expired confirmations...')

      await cleanupExpiredConfirmations(req.payload, req)

      req.payload.logger.info('Cleanup job completed successfully')

      return {
        output: {},
      }
    } catch (error) {
      req.payload.logger.error('Error in cleanup job:', error)
      return {
        state: 'failed' as const,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },
  inputSchema: [],
  retries: 3,
} satisfies import('payload').TaskConfig
