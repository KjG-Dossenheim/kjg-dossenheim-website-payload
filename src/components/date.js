import { parseISO, format } from 'date-fns'
import { de } from "date-fns/locale";

export default function Date({ dateString }) {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'EEEE, d. MMMM yyyy',{ locale: de })}</time>
}
