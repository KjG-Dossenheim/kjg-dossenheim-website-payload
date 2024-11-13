// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle } from '@payloadcms/plugin-seo/types'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Team } from './collections/Team'
import { TeamBilder } from './collections/TeamBilder'

import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { Rechtliches } from './globals/Rechtliches'
import { Aktionen } from './globals/Aktionen'
import { Startseite } from './globals/Startseite'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const generateTitle: GenerateTitle = () => {
  return 'KjG Dossenheim'
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
  collections: [Pages, Team, TeamBilder, Users, Media],
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
    }),
  ],
})
