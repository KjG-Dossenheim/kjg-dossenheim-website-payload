// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { OAuth2Plugin } from 'payload-oauth2'

import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
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

import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { Rechtliches } from './globals/Rechtliches'
import { Aktionen } from './globals/Aktionen'
import { Startseite } from './globals/Startseite'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const generateTitle: GenerateTitle = ({ doc }) => {
  return doc?.title ? `${doc.title} | KjG Dossenheim` : 'KjG Dossenheim'
}

const generateURL: GenerateURL = ({ doc }) => {
  return doc?.slug
    ? `${process.env.NEXT_PUBLIC_SERVER_URL!}/${doc.slug}`
    : process.env.NEXT_PUBLIC_SERVER_URL!
}

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
  collections: [Team, TeamBilder, Users, Media],
  globals: [Startseite, Aktionen, Header, Footer, Rechtliches],
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
  plugins: [
    seoPlugin({
      generateTitle,
      generateURL,
    }),
    formBuilderPlugin({
      formOverrides: {
        slug: 'contact-forms',
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
