import { parseISO, format } from 'date-fns'
import { de } from 'date-fns/locale'

/**
 * Formats a date string using German locale
 * @param dateString - ISO date string to format
 * @param formatString - Format pattern for the date
 * @returns Formatted date string
 */
export const formatDateLocale = (dateString: string, formatString: string): string => {
    const date = parseISO(dateString)
    return format(date, formatString, { locale: de })
}

export default formatDateLocale

