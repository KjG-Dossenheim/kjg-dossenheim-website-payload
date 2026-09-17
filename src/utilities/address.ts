/**
 * Matches a street line whose last token looks like a house number
 * (starts with a digit, e.g. "23", "1-3", "12a").
 */
const STREET_WITH_HOUSE_NUMBER_PATTERN = /^(.*?)[\s,]+(\d[\w\-/]*)$/

export type SplitAddress = {
  street: string
  houseNumber: string
}

/**
 * Splits a single-line address such as "Haeberlinstr. 1-3" into its
 * street and house number parts.
 *
 * Returns `street` with the full input when no trailing house number
 * can be detected, so no information is lost.
 */
export function splitStreetAndHouseNumber(value: unknown): SplitAddress {
  if (typeof value !== 'string') {
    return { street: '', houseNumber: '' }
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return { street: '', houseNumber: '' }
  }

  const match = trimmed.match(STREET_WITH_HOUSE_NUMBER_PATTERN)

  if (!match) {
    return { street: trimmed, houseNumber: '' }
  }

  return {
    street: match[1].trim(),
    houseNumber: match[2].trim(),
  }
}
