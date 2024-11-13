import { parseISO, format } from 'date-fns'
import { de } from "date-fns/locale";

export default function Date({ dateString }) {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'H:mm',{ locale: de })}</time>
}
