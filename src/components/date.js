import { parseISO, format } from 'date-fns'
import { de } from "date-fns/locale";

export default function Date({ dateString, formatString }) {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, formatString, { locale: de })}</time>
}
