# GitHub Copilot Instructions

KjG Dossenheim website — Next.js 15+ / Payload CMS 3.x for a Catholic youth organization in Germany. UI is **German-first** (all labels, copy, and admin fields in German).

## Stack

- **Next.js 15+** App Router · **React 19** · **TypeScript** (strict)
- **Payload CMS 3.x** — headless CMS, MongoDB via Mongoose
- **Tailwind CSS 4.x** · **Radix UI** + **react-aria-components** + **lucide-react** (shadcn-style components in `src/components/ui/`)
- **react-hook-form** + **zod** — form validation
- **Lexical** rich text editor with custom blocks
- **Cloudflare R2** (S3-compatible) for media storage
- **pnpm** — package manager

## Project Structure

```
src/
├── app/
│   ├── (website)/   # Public website — German locale, ISR pages, Server Actions
│   └── (payload)/   # Payload admin panel & API (auto-generated — never edit layout.tsx)
├── collections/     # Payload CMS data models
├── globals/         # Payload CMS singletons (one instance per slug)
├── blocks/          # Lexical editor blocks (schema/config + React component)
├── components/      # admin/ · common/ · email/ · layout/ · ui/ · utils/
├── jobs/            # Payload background job definitions (see src/jobs/README.md)
├── styles/          # globals.css · payloadStyles.css · theme.css
└── utilities/       # Shared helpers
```

## Import Aliases

Always use — never use relative `../../` cross-boundary imports:

| Alias             | Resolves to             |
| ----------------- | ----------------------- |
| `@/*`             | `src/*`                 |
| `@payload-config` | `src/payload.config.ts` |

## Build & Dev Commands

```bash
pnpm dev              # Dev server
pnpm build            # Production build (postbuild runs next-sitemap)
pnpm devsafe          # rm -rf .next && dev (use when cache issues arise)
pnpm generate:types   # Regenerate src/payload-types.ts after schema changes
pnpm lint:fix         # Auto-fix ESLint issues
pnpm email-dev        # Email preview server on :3030
```

> **No test suite.** The project uses ESLint + Prettier only. After changes, run `pnpm lint` to validate.

## Data Fetching in Pages

Pages use async Server Components with ISR and direct Payload access — no REST calls:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

export const revalidate = 60 // ISR

export async function generateMetadata(): Promise<Metadata> { /* ... */ }

export default async function Page() {
  const payload = await getPayload({ config })
  const data = await payload.findGlobal({ slug: 'sommerfreizeit' })
  // or: payload.find({ collection: 'blogPosts', where: { _status: { equals: 'published' } } })
  return <RichText data={data.content} />
}
```

## Server Actions (prefer over API routes)

```typescript
// src/app/(website)/[route]/actions.ts
'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function myAction(formData: FormData) {
  const payload = await getPayload({ config })
  // validate with zod, then payload.create(...)
}
```

## Collections & Globals

**Adding a collection:**

1. `src/collections/MyCollection.ts`
2. Add to `collections[]` in `src/payload.config.ts`
3. `pnpm generate:types`

**Adding a global:**

1. `src/globals/MyGlobal.ts`
2. Add to `globals[]` in `src/payload.config.ts`
3. `pnpm generate:types`

**Conventions:**

- Public read access: `access: { read: () => true }`
- Date display format: `'dd.MM.yyyy HH:mm'`
- Admin sidebar groups via `admin.group` (e.g. `'Aktionen'`, `'Medien'`)
- Place collection hooks in `src/collections/[name]/hooks/` (`afterChange`, `beforeChange`, `beforeDelete`)

## Lexical Blocks

Each block lives in `src/blocks/[name]/`. Two naming conventions exist in the codebase:

| Style           | Files                                                    | Used by                           |
| --------------- | -------------------------------------------------------- | --------------------------------- |
| Component style | `config.ts` + `Component.tsx` (+ `Component.Client.tsx`) | FormBlock, Code, Gallery          |
| Server style    | `schema.ts` + `Server.tsx`                               | cover, image, videoPlayer, lyrics |

**Adding a block:**

1. Create the block folder with config/schema + component
2. Register in `payload.config.ts` under `BlocksFeature({ blocks: [...] })`
3. Add JSX converter in `src/components/utils/RichText/index.tsx`

**Currently registered:** `FormBlock`, `Code`, `Gallery` (+ `cover`, `image`, `videoPlayer`, `lyrics` as inline blocks)

## Background Jobs

```typescript
// src/jobs/myJob.ts
export const myJob = {
  slug: 'myJob',
  interfaceName: 'MyJob',
  handler: async ({ req }: any) => {
    /* logic */
  },
  inputSchema: [],
  retries: 3,
} as const
```

Register in `payload.config.ts` → `jobs.tasks`. Queue with `payload.jobs.queue({ task: 'myJob', waitUntil: date })`. See `src/jobs/README.md` for full docs.

**Active jobs:** `cleanupExpiredConfirmations` · `sendRegistrationEmails` · `sendConfirmationEmails`

## Authentication

Two independent auth systems — always be aware of context:

| System                          | Collection           | Scope                             |
| ------------------------------- | -------------------- | --------------------------------- |
| Admin (OAuth2 via Authentik)    | `Users`              | CMS admin panel                   |
| Sommerfreizeit (email/password) | `sommerfreizeitUser` | `/sommerfreizeit/(auth)/*` routes |

## Critical Rules

- **Never modify** `src/app/(payload)/layout.tsx` — auto-generated by Payload
- **Always run** `pnpm generate:types` after any schema change
- **`@/*` aliases only** — no `../../` cross-boundary relative imports
- **Both registrations required for Lexical blocks**: `payload.config.ts` BlocksFeature AND `RichText/index.tsx` jsxConverters
- **Confirmation tokens**: SHA-256 hashed with `PAYLOAD_SECRET` — never expose or weaken
