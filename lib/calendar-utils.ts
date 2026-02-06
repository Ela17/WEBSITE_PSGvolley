/**
 * Utility functions for calendar component
 */

/**
 * Genera link Google Maps dall'indirizzo
 * L'indirizzo dovrebbe essere già pulito (campo indirizzo_maps dal DB)
 */
export function getGoogleMapsLink(indirizzo: string): string {
  // Aggiungi Italia se non presente per risultati migliori
  let query = indirizzo;
  if (!query.toLowerCase().includes("italia")) {
    query += ", Italia";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
