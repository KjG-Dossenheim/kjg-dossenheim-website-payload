import { parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'

/**
 * Formats a date string using German locale
 * @param dateString - ISO date string to format
 * @param formatString - Format pattern for the date
 * @param timeZone - IANA time zone name (defaults to "Europe/Berlin")
 * @returns Formatted date string
 */
export const formatDateLocale = (dateString: string, formatString: string, timeZone: string = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? 'Etc/UTC'): string => {
    const date = parseISO(dateString)
    return formatInTimeZone(date, timeZone, formatString, { locale: de })
}

export default formatDateLocale

