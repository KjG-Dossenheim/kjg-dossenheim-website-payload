import type { GlobalConfig } from 'payload'

export const knallbonbonSettings: GlobalConfig = {
  slug: 'knallbonbonSettings',
  label: 'Einstellungen',
  admin: {
    group: 'Knallbonbon',
  },
  fields: [
    {
      name: 'confirmationDeadlineDays',
      label: 'Bestätigungsfrist (Tage)',
      type: 'number',
      defaultValue: 7,
      min: 1,
      max: 30,
      required: true,
      admin: {
        description:
          'Anzahl der Tage, die Eltern Zeit haben, um ihre Teilnahme zu bestätigen, nachdem sie von der Warteliste befördert wurden.',
      },
    },
  ],
}
