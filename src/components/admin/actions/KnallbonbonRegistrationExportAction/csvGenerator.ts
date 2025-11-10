import { formatDate } from 'date-fns'
import type { Registration, ChildWithParent } from './schema'
import { pickupLabels, genderLabels } from './schema'

/**
 * Generate CSV content from registrations
 * @param registrations - Array of registrations to export
 * @returns CSV string content
 */
export const generateCSV = (registrations: Registration[]): string => {
  // Flatten all children from all registrations with parent info
  const allChildren: ChildWithParent[] = []
  registrations.forEach((reg) => {
    if (reg.child && reg.child.length > 0) {
      reg.child.forEach((child) => {
        allChildren.push({
          ...child,
          parentName: `${reg.firstName} ${reg.lastName}`,
          parentPhone: reg.phone,
          parentEmail: reg.email,
          parentAddress: reg.address,
        })
      })
    }
  })

  // CSV Header
  const headers = [
    'Nr.',
    'Vorname',
    'Nachname',
    'Geburtsdatum',
    'Alter',
    'Geschlecht',
    'Abholung',
    'Fotogenehmigung',
    'Gesundheitsinfos',
    'Elternteil',
    'Telefon',
    'Email',
    'Adresse',
  ]

  // CSV Rows
  const rows = allChildren.map((child, index) => {
    return [
      index + 1,
      child.firstName || '',
      child.lastName || '',
      child.dateOfBirth ? formatDate(new Date(child.dateOfBirth), 'dd.MM.yyyy') : '',
      child.age ? `${child.age}` : '',
      child.gender ? genderLabels[child.gender] : '',
      child.pickupInfo ? pickupLabels[child.pickupInfo] : '',
      child.photoConsent ? 'Ja' : 'Nein',
      child.healthInfo || '',
      child.parentName,
      child.parentPhone || '',
      child.parentEmail,
      child.parentAddress || '',
    ]
  })

  // Escape CSV values
  const escapeCSV = (value: string | number): string => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')

  return csvContent
}
