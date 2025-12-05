# Payload Jobs

This directory contains Payload CMS job tasks that can be queued and executed asynchronously.

## Available Jobs

### sendRegistrationEmails

Sends registration confirmation emails asynchronously when a new Knallbonbon registration is created.

**What it does:**
- Sends admin notification email about the new registration
- Sends user confirmation email (different content for waitlist vs. confirmed registrations)
- Handles email failures gracefully with automatic retries (3 retries)

**Usage:**
Automatically queued by the registration form submission action. Executes immediately (no delay).

### sendConfirmationEmails

Sends confirmation emails when a waitlisted user confirms their spot.

**What it does:**
- Sends confirmation success email to the user
- Sends admin notification about the confirmation
- Handles email failures gracefully with automatic retries (3 retries)

**Usage:**
Automatically queued by the confirmation action. Executes immediately (no delay).

### cleanupExpiredConfirmations

Cleans up expired waitlist promotion confirmations for the Knallbonbon event system.

**What it does:**
- Finds registrations on the waitlist that were promoted but didn't confirm within the deadline
- Resets their promotion status (removes `promotionSentAt` and `confirmationDeadline`)
- Sends admin notification emails
- Triggers promotion for the next person in line

**Scheduling:**

This job needs to be manually queued. To run it daily at 1:00 AM, you can:

1. **Manually queue it once** (it will need to be re-queued after each run):

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Calculate next 1:00 AM
const nextRun = new Date()
nextRun.setDate(nextRun.getDate() + 1)
nextRun.setHours(1, 0, 0, 0)

await payload.jobs.queue({
  task: 'cleanupExpiredConfirmations',
  input: {},
  waitUntil: nextRun,
})
```

2. **Use a cron service** (recommended for production):
   - **Vercel Cron**: Add to `vercel.json`
   - **GitHub Actions**: Create a workflow that calls an API endpoint
   - **cron-job.org**: Set up a scheduled HTTP request

## How Jobs Work

Jobs in Payload CMS 3.x are stored in the `payload-jobs` MongoDB collection and processed automatically when `autoRun` is enabled in the config.

- Jobs are queued using `payload.jobs.queue()`
- The `waitUntil` parameter allows scheduling jobs for future execution
- Jobs can be retried automatically on failure (configured with `retries` property)
- Job status can be monitored through the Payload admin panel

## Creating New Jobs

To create a new job:

1. Create a new file in `src/jobs/` with your job configuration
2. Export a task config object with `slug`, `interfaceName`, and `handler`
3. Import and add it to the `tasks` array in `src/payload.config.ts`

Example:

```typescript
// src/jobs/myNewJob.ts
export const myNewJob = {
  slug: 'myNewJob',
  interfaceName: 'MyNewJob',
  handler: async ({ req }: any) => {
    // Your job logic here
    req.payload.logger.info('Job running...')
  },
  inputSchema: [],
  retries: 3,
} as const
```

Then add to config:

```typescript
// src/payload.config.ts
import { myNewJob } from './jobs/myNewJob'

export default buildConfig({
  // ...
  jobs: {
    tasks: [cleanupExpiredConfirmationsJob, myNewJob],
  },
})
```

## Resources

- [Payload Jobs Queue Documentation](https://payloadcms.com/docs/jobs-queue/overview)
- [Payload Tasks Documentation](https://payloadcms.com/docs/jobs-queue/tasks)
