// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { OAuth2Plugin } from 'payload-oauth2'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Team } from './collections/Team'
import { TeamBilder } from './collections/TeamBilder'
import { Jahresplan } from './collections/Jahresplan'

import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { Rechtliches } from './globals/Rechtliches'
import { Startseite } from './globals/Startseite'
import { About } from './globals/About'

import { Sommerfreizeit } from './globals/Sommerfreizeit'
import { Adventsmarkt } from './globals/Adventsmarkt'
import { Martinsumzug } from './globals/Martinsumzug'
import { Tannenbaumaktion } from './globals/Tannenbaumaktion'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: 'KjG Dossenheim',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    dateFormat: 'dd.MM.yyyy',
  },
  collections: [Jahresplan, Team, TeamBilder, Users, Media],
  globals: [Startseite, Adventsmarkt, Martinsumzug, Sommerfreizeit, Tannenbaumaktion, About, Header, Footer, Rechtliches],
  editor: lexicalEditor({}),
  i18n: {
    supportedLanguages: { en, de },
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  email: nodemailerAdapter({
    defaultFromAddress: 'info@kjg-dossenheim.org',
    defaultFromName: 'KjG Dossenheim',
    // Nodemailer transportOptions
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  plugins: [
    seoPlugin({
    }),
    formBuilderPlugin({
      formOverrides: {
        slug: 'forms',
        labels: { 
          singular: 'Formular',
          plural: 'Formulare',
        },
        access: {
          read: ({ req: { user } }) => !!user, // authenticated users only
          update: () => false,
        },
        fields: ({ defaultFields }) => {
          return [
            ...defaultFields,
            {
              name: 'custom',
              type: 'text',
            },
          ]
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
  ],
})
