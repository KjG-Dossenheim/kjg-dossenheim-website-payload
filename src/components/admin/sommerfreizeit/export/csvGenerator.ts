import { format } from 'date-fns'
import { EXPORT_HEADERS, type ExportPeriod, type ExportRow } from './types'

const SEPARATOR = ';'

/** Gender mapping expected by the export format. */
const GENDER_LABELS: Record<string, string> = {
  female: 'w',
  male: 'm',
  diverse: '',
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeCountry(value: unknown): string {
  return normalizeText(value).toLowerCase()
}

function formatDateValue(value?: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return format(date, 'dd.MM.yy')
}

/** Inclusive day count between two dates, formatted with a decimal comma. */
function formatDuration(from?: string | null, until?: string | null): string {
  if (!from || !until) {
    return ''
  }

  const start = new Date(from)
  const end = new Date(until)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return ''
  }

  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1

  if (!Number.isFinite(days) || days < 0) {
    return ''
  }

  return days.toFixed(2).replace('.', ',')
}

/** Escapes a single CSV value (semicolon-separated). */
export function escapeCsv(value: string | number): string {
  const str = String(value ?? '')

  if (
    str.includes(SEPARATOR) ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Builds the semicolon-separated CSV content for the Sommerfreizeit export.
 * The participation period and duration are shared by all rows and come from
 * the selected event.
 */
export function generateCSV(rows: ExportRow[], period: ExportPeriod = {}): string {
  const from = formatDateValue(period.from)
  const until = formatDateValue(period.until)
  const duration = formatDuration(period.from, period.until)

  const lines = rows.map((row) => [
    normalizeText(row.firstName),
    normalizeText(row.lastName),
    normalizeText(row.street),
    normalizeText(row.houseNumber),
    normalizeText(row.postalCode),
    normalizeText(row.city),
    normalizeCountry(row.country),
    GENDER_LABELS[row.gender ?? ''] ?? '',
    formatDateValue(row.dateOfBirth),
    row.personType,
    from,
    until,
    duration,
    normalizeText(row.juleica),
  ])

  return [
    EXPORT_HEADERS.map((header) => escapeCsv(header)).join(SEPARATOR),
    ...lines.map((line) => line.map((value) => escapeCsv(value)).join(SEPARATOR)),
  ].join('\n')
}
