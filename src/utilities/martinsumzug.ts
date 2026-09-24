/**
 * True when `startDate` falls on today's calendar day — the only window in which
 * the song pages (`/martinsumzug/lieder/[slug]`) are reachable, since they gate
 * on `notFound()` outside of it.
 *
 * Shared so the route's guard and the link state on `/martinsumzug` can't drift
 * apart.
 */
export function isMartinsumzugToday(startDate: string | null | undefined): boolean {
  if (!startDate) return false
  return new Date(startDate).toDateString() === new Date().toDateString()
}

/**
 * Fallback coordinates for the parade, as `[longitude, latitude]`.
 *
 * These are the values the map used to hardcode before they moved into the
 * global's `startLocation`, `endLocation` and `viaLocation` point fields. They
 * keep an unset point field from leaving the router with nothing to work from.
 *
 * The `via` point is load-bearing: dropping it makes the router take the 339 m
 * shortcut down the Heidelberger Straße instead of the recognisable loop via
 * Friedrichstraße and Bahnhofstraße.
 */
export const MARTINSUMZUG_DEFAULT_ROUTE: Record<'start' | 'via' | 'end', [number, number]> = {
  start: [8.677112, 49.450017],
  via: [8.672022, 49.450027],
  end: [8.675105, 49.451762],
}
