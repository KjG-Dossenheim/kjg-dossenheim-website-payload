// Node.js built-in modules
import path from 'path'
import { fileURLToPath } from 'url'

// External packages
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
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

// Relative imports - lib
import { authentikOAuth } from './utilities/authentikOAuth'

// Relative imports - jobs
import { cleanupExpiredConfirmationsJob } from './jobs/cleanupExpiredConfirmations'
import { sendRegistrationEmailsJob } from './jobs/sendRegistrationEmails'
import { sendConfirmationEmailsJob } from './jobs/sendConfirmationEmails'
import { migrateWaitlistDataJob } from './jobs/migrateWaitlistData'

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
      afterLogin: [
        "@/components/admin/button/AuthentikOAuthLoginButton#AuthentikOAuthLoginButton",
      ],
      graphics: {
        Logo: '@/graphics/Logo',
        Icon: '@/graphics/Icon',
      },
      beforeNavLinks: [
        '@/components/admin/beforeNavLinks/NavLogo',
      ],
      // Nav: '@/components/admin/Nav/CustomNavBasic',
      settingsMenu: ['@/components/admin/settingsMenu/MySettingsMenu'],
      views: {
        knallbonbon: {
          path: '/knallbonbon',
          Component: '@/components/admin/views/KnallbonbonView',
        },
        knallbonbonChildren: {
          path: '/knallbonbon/list-children',
          Component: '@/components/admin/views/KnallbonbonChildrenView',
        },
        knallbonbonWaitlist: {
          path: '/knallbonbon/waitlist',
          Component: '@/components/admin/views/KnallbonbonView/WaitlistView',
        },
        settings: {
          path: '/settings',
          Component: '@/components/admin/views/SettingsView',
        },
        emailPreview: {
          path: '/email-preview',
          Component: '@/components/admin/views/PreviewEmailView',
        },
      },
    },
    /* livePreview: {
      url: ({
        data,
      }) => `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${data.slug}`,
      collections: [''],
    }, */
  },
  collections: [
    Jahresplan,
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
    sommerfreizeitUser,
    sommerfreizeitAnmeldung,
    sommerfreizeitFeedback
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
      migrateWaitlistDataJob,
    ],
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
    authentikOAuth,
  ],

})
