// Node.js built-in modules
import path from 'path'
import { fileURLToPath } from 'url'

// External packages
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { betterAuth } from 'better-auth'
import { magicLink } from 'better-auth/plugins'
import { emailOTP } from "better-auth/plugins"
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { payloadEnhancedSidebar } from '@veiag/payload-enhanced-sidebar'
import {
  betterAuthCollections,
  createBetterAuthPlugin,
  payloadAdapter,
} from '@delmaredigital/payload-better-auth'
import {
  BoldFeature,
  lexicalEditor,
  UnderlineFeature,
  OrderedListFeature,
  UnorderedListFeature,
  LinkFeature,
  ItalicFeature,
  InlineToolbarFeature,
  FixedToolbarFeature,
  StrikethroughFeature,
  InlineCodeFeature,
  ParagraphFeature,
  HeadingFeature,
  SubscriptFeature,
  SuperscriptFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  IndentFeature,
  ChecklistFeature,
  AlignFeature,
  TextStateFeature,
  // defaultColors,
  UploadFeature,
  BlocksFeature
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { de } from '@payloadcms/translations/languages/de'

// Relative imports - blocks
// import { Lyrics } from './blocks/lyrics/'
import { FormBlock } from './blocks/FormBlock/config'
import { Code } from './blocks/Code/config'
import { Gallery } from './blocks/gallery/config'

// Relative imports - collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Team } from './collections/Team'
import { TeamBilder } from './collections/TeamBilder'
import { Jahresplan } from './collections/Jahresplan'
import { blogPosts } from './collections/blogPost'
import { blogCategory } from './collections/blogCategory'
import { knallbonbonRegistration } from './collections/knallbonbonRegistration'
import { knallbonbonEvents } from './collections/knallbonbonEvents'
import { knallbonbonWaitlist } from './collections/knallbonbonWaitlist'
import { membershipApplication } from './collections/membershipApplication'
import { Songs } from './collections/Songs'
import { sommerfreizeitAnmeldung } from './collections/sommerfreizeit/sommerfreizeitAnmeldung'
import { sommerfreizeitUser } from './collections/sommerfreizeit/sommerfreizeitUser'
import { sommerfreizeitFeedback } from './collections/sommerfreizeit/sommerfreizeitFeedback'
import { Feedback } from './collections/Feedback'
import { sommerfreizeitChild } from './collections/sommerfreizeit/sommerfreizeitChild'
import { sommerfreizeitEvents } from './collections/sommerfreizeit/sommerfreizeitEvents'
import { sommerfreizeitOrders } from './collections/sommerfreizeit/sommerfreizeitOrders'
import { sommerfreizeitRooms } from './collections/sommerfreizeit/sommerfreizeitRooms'

// Relative imports - globals
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { Rechtliches } from './globals/Rechtliches'
import { Startseite } from './globals/Startseite'
import { About } from './globals/About'
import { Sommerfreizeit } from './globals/Sommerfreizeit'
import { Adventsmarkt } from './globals/Adventsmarkt'
import { Martinsumzug } from './globals/Martinsumzug'
import { Tannenbaumaktion } from './globals/Tannenbaumaktion'
import { Knallbonbon } from './globals/Knallbonbon'
import { knallbonbonSettings } from './globals/knallbonbonSettings'
import { aktion72Stunden } from './globals/aktionen/72stunden'
import { sommerfreizeitLandingPage } from './globals/sommerfreizeit/sommerfreizeitLandingPage'
import { sommerfreizeitPackliste } from './globals/sommerfreizeit/sommerfreizeitPackliste'
import { sommerfreizeitSettings } from './globals/sommerfreizeit/sommerfreizeitSettings'

// Relative imports - jobs
import { cleanupExpiredConfirmationsJob } from './jobs/cleanupExpiredConfirmations'
import { sendRegistrationEmailsJob } from './jobs/sendRegistrationEmails'
import { sendConfirmationEmailsJob } from './jobs/sendConfirmationEmails'
import { importPretixCustomersJob } from './jobs/importPretixCustomers'
import { importPretixOrdersJob } from './jobs/importPretixOrders'
import { syncPretixStatusJob } from './jobs/syncPretixStatus'
// import { fetchIndividualOrderJob } from './jobs/pretix/fetchIndividualOrder'

import { betterAuthOptions } from './lib/auth/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    autoRefresh: true,
    meta: {
      titleSuffix: process.env.NEXT_PUBLIC_SITE_NAME,
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    timezones: {
      defaultTimezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? 'Etc/UTC',
    },
    dateFormat: 'dd.MM.yyyy',
    components: {
      graphics: {
        Logo: '@/graphics/Logo',
        Icon: '@/graphics/Icon',
      },
      beforeNavLinks: [
        '@/components/admin/beforeNavLinks/NavLogo',
      ],
      settingsMenu: ['@/components/admin/settingsMenu/MySettingsMenu'],
      views: {
        knallbonbon: {
          path: '/knallbonbon',
          Component: '@/components/admin/Knallbonbon/Views/DefaultView',
        },
        knallbonbonChildren: {
          path: '/knallbonbon/list-children',
          Component: '@/components/admin/Knallbonbon/Views/ChildrenListView',
        },
        knallbonbonWaitlist: {
          path: '/knallbonbon/waitlist',
          Component: '@/components/admin/Knallbonbon/Views/WaitlistView',
        },
        settings: {
          path: '/settings',
          Component: '@/components/admin/views/SettingsView',
        },
        sommerfreizeitDashboard: {
          path: '/sommerfreizeit/dashboard',
          Component: '@/components/admin/sommerfreizeit/dashboard',
        },
        sommerfreizeitImportJson: {
          path: '/sommerfreizeit/import-json',
          Component: '@/components/admin/sommerfreizeit/importJson',
        },
        emailPreview: {
          path: '/email-preview',
          Component: '@/components/admin/views/PreviewEmailView',
        },
      },
    },
  },
  collections: [
    Jahresplan,
    sommerfreizeitAnmeldung,
    sommerfreizeitChild,
    sommerfreizeitRooms,
    sommerfreizeitEvents,
    sommerfreizeitUser,
    sommerfreizeitOrders,
    sommerfreizeitFeedback,
    blogPosts,
    blogCategory,
    Team,
    TeamBilder,
    Users,
    Media,
    knallbonbonRegistration,
    knallbonbonEvents,
    knallbonbonWaitlist,
    membershipApplication,
    Feedback,
    Songs,
  ],
  globals: [
    Startseite,
    Adventsmarkt,
    Martinsumzug,
    Sommerfreizeit,
    Tannenbaumaktion,
    aktion72Stunden,
    About,
    Header,
    Footer,
    Rechtliches,
    Knallbonbon,
    knallbonbonSettings,
    sommerfreizeitPackliste,
    sommerfreizeitLandingPage,
    sommerfreizeitSettings,
  ],
  editor: lexicalEditor({
    features: [
      BoldFeature(),
      UnderlineFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      LinkFeature(
        {
          enabledCollections: ['blogPosts'],
        }
      ),
      ItalicFeature(),
      InlineToolbarFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      SubscriptFeature(),
      SuperscriptFeature(),
      InlineCodeFeature(),
      ParagraphFeature(),
      HeadingFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      IndentFeature(),
      ChecklistFeature(),
      AlignFeature(),
      TextStateFeature({
        state: {
          color: {
            galaxy: { label: 'Galaxy', css: { background: 'linear-gradient(to right, #0000ff, #ff0000)', color: 'white' } },
          },
        },
      }),
      FixedToolbarFeature(),
      UploadFeature(),
      BlocksFeature({
        blocks: [FormBlock, Code, Gallery],
      })
    ]
  }),
  i18n: {
    supportedLanguages: { de },
  },
  secret: process.env.PAYLOAD_SECRET || '',
  cors: {
    origins: [`${process.env.NEXT_PUBLIC_SITE_URL}`, 'http://localhost:8081'],
    headers: ['x-custom-header'],
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  jobs: {
    tasks: [
      cleanupExpiredConfirmationsJob,
      sendRegistrationEmailsJob,
      sendConfirmationEmailsJob,
      importPretixCustomersJob,
      importPretixOrdersJob,
      syncPretixStatusJob,
      // fetchIndividualOrderJob,
    ],
    workflows: [],
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }

      defaultJobsCollection.admin.hidden = false
      return defaultJobsCollection
    },
    autoRun: [
      {
        cron: '* * * * *', // every minute
        limit: 100,
        queue: 'default',
      },
    ],
  },
  sharp,
  email: nodemailerAdapter({
    defaultFromAddress: 'info@kjg-dossenheim.org',
    defaultFromName: process.env.NEXT_PUBLIC_SITE_NAME || 'KjG',
    // Nodemailer transportOptions
    transportOptions: {
      host: process.env.SMTP_HOST,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  plugins: [
    seoPlugin({
      uploadsCollection: 'media',
      tabbedUI: true,
      generateURL: ({ doc }) =>
        `${process.env.NEXT_PUBLIC_SITE_URL}/${doc.title?.toLocaleLowerCase() || ''}`,
      generateTitle: ({ doc }) => `${doc.title || ''}`,
      generateImage: ({ doc }) => `${process.env.NEXT_PUBLIC_SITE_URL}/api/og/?title=${encodeURIComponent(doc.title || '')}`
    }),
    importExportPlugin({
      collections: [{ slug: 'sommerfreizeitAnmeldung' }],
    }),
    formBuilderPlugin({
      formOverrides: {
        slug: 'forms',
        labels: {
          singular: 'Formular',
          plural: 'Formulare',
        },
      },
    }),
    s3Storage({
      collections: {
        media: true,
        teambilder: {
          prefix: 'teambilder',
        },
      },
      bucket: process.env.S3_BUCKET_NAME || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        // ... Other S3 configuration
      },
    }),
    betterAuthCollections({
      betterAuthOptions,
      skipCollections: ['user'],
      firstUserAdmin: false,
    }),
    createBetterAuthPlugin({
      createAuth: (payload) =>
        betterAuth({
          ...betterAuthOptions,
          database: payloadAdapter({ payloadClient: payload }),
          plugins: [
            magicLink({
              sendMagicLink: async ({ email, url }) => {
                await payload.sendEmail({
                  to: email,
                  subject: 'Dein Magic Link fuer die Sommerfreizeit',
                  html: `<p>Hallo,</p><p>klicke auf den folgenden Link, um dich bei der Sommerfreizeit anzumelden:</p><p><a href="${url}">Jetzt anmelden</a></p><p>Falls du den Login nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>`,
                  text: `Hallo,\n\nverwende diesen Link fuer deine Anmeldung bei der Sommerfreizeit:\n${url}\n\nFalls du den Login nicht angefordert hast, kannst du diese E-Mail ignorieren.`,
                })
                payload.logger.info(`Magic Link für ${email} gesendet.`)
              },
            }),
            emailOTP({
              async sendVerificationOTP({ email, otp, type }) {
                if (type === "sign-in") {
                  // Send the OTP for sign in
                  await payload.sendEmail({
                    to: email,
                    subject: 'Dein Bestätigungscode für die Sommerfreizeit',
                    html: `<p>Hallo,</p><p>dein Bestätigungscode ist: <strong>${otp}</strong></p><p>Dieser Code ist 15 Minuten gültig.</p><p>Falls du die Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>`,
                    text: `Hallo,\n\ndein Bestätigungscode ist: ${otp}\n\nDieser Code ist 15 Minuten gültig.\n\nFalls du die Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.`,
                  })
                  payload.logger.info(`Verification OTP für ${email} gesendet.`)
                } else if (type === "email-verification") {
                  // Send the OTP for email verification
                  await payload.sendEmail({
                    to: email,
                    subject: 'Deine E-Mail-Adresse bestätigen',
                    html: `<p>Hallo,</p><p>dein Bestätigungscode ist: <strong>${otp}</strong></p><p>Dieser Code ist 15 Minuten gültig.</p><p>Falls du die Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>`,
                    text: `Hallo,\n\ndein Bestätigungscode ist: ${otp}\n\nDieser Code ist 15 Minuten gültig.\n\nFalls du die Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.`,
                  })
                  payload.logger.info(`Email verification OTP für ${email} gesendet.`)
                } else {
                  // Send the OTP for password reset
                  await payload.sendEmail({
                    to: email,
                    subject: 'Passwort zurücksetzen',
                    html: `<p>Hallo,</p><p>dein Bestätigungscode ist: <strong>${otp}</strong></p><p>Dieser Code ist 15 Minuten gültig.</p><p>Falls du die Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>`,
                    text: `Hallo,\n\ndein Bestätigungscode ist: ${otp}\n\nDieser Code ist 15 Minuten gültig.\n\nFalls du die Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.`,
                  })
                  payload.logger.info(`Password reset OTP für ${email} gesendet.`)
                }
              },
            }),
          ],
        }),
      autoInjectAdminComponents: false,
    }),
    payloadEnhancedSidebar({
      tabs: [
        {
          id: 'dashboard',
          type: 'link',
          href: '/',
          icon: 'House',
          label: "Dashboard",
        },
        {
          id: 'sommerfreizeit',
          type: 'tab',
          icon: 'Sun',
          label: 'Sommerfreizeit',
          customItems: [
            {
              slug: 'sommerfreizeit-dashboard',
              href: '/sommerfreizeit',
              label: 'Dashboard',
              position: 'top'
            },
            {
              slug: 'sommerfreizeitAnmeldung',
              href: '/collections/sommerfreizeitAnmeldung',
              label: 'Anmeldungen',
            },
            {
              slug: 'sommerfreizeitEvents',
              href: '/collections/sommerfreizeitEvents',
              label: 'Freizeiten',
            },
            {
              slug: 'sommerfreizeitRooms',
              href: '/collections/sommerfreizeitRooms',
              label: 'Zimmer',
            },
            {
              slug: 'sommerfreizeitUsers',
              href: '/collections/sommerfreizeitUsers',
              label: 'Benutzer',
            },
            {
              slug: 'sommerfreizeitOrders',
              href: '/collections/sommerfreizeitOrders',
              label: 'Bestellungen',
            },
            {
              slug: 'sommerfreizeitFeedback',
              href: '/collections/sommerfreizeitFeedback',
              label: 'Feedback',
            },
            {
              slug: 'sommerfreizeit-import-json',
              href: '/sommerfreizeit/import-json',
              label: 'JSON importieren',
              position: 'bottom',
            },
          ],
        },
        {
          id: 'knallbonbon',
          type: 'tab',
          icon: 'PartyPopper',
          label: 'Knallbonbon',
          collections: ['knallbonbonRegistration', 'knallbonbonEvents', 'knallbonbonWaitlist'],
        }
      ],
      disabled: true,
    }),
  ],
})
