/**
 * Utility functions for calendar component
 */

/**
 * Normalizza abbreviazioni comuni negli indirizzi italiani
 */
function normalizeAbbreviations(text: string): string {
  const abbreviations: Record<string, string> = {
    "c.so": "Corso",
    "c/so": "Corso",
    "p.zza": "Piazza",
    "p.za": "Piazza",
    "v.le": "Viale",
    "v/le": "Viale",
    "str.": "Strada",
    "vic.": "Vicolo",
    "l.go": "Largo",
  };

  let normalized = text;

  // Sostituisci abbreviazioni (case insensitive)
  for (const [abbr, full] of Object.entries(abbreviations)) {
    const regex = new RegExp(`\\b${abbr.replace(".", "\\.")}\\b`, "gi");
    normalized = normalized.replace(regex, full);
  }

  return normalized;
}

/**
 * Pulisce ed estrae l'indirizzo dalla stringa della palestra
 */
function cleanAddress(palestra: string): string {
  // Normalizza abbreviazioni
  let cleaned = normalizeAbbreviations(palestra);

  // Pattern per identificare indirizzi
  const addressPatterns = [
    /(?:Via|Corso|Piazza|Viale|Strada|Vicolo|Largo)\s+[^,]+(?:,\s*\d+)?/i,
  ];

  // Cerca pattern di indirizzo
  for (const pattern of addressPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let address = match[0].trim();

      // Lista città effettivamente presenti nei CSV del campionato
      const cities = [
        "TO",
        "Torino",
        "Moncalieri",
        "Caselette",
        "Vauda C.se",
        "Givoletto",
        "Santena",
        "Volpiano",
        "Castagnole Piemonte",
        "Collegno",
        "Feletto",
        "San Benigno Canavese",
        "Borgofranco d'Ivrea",
      ];

      // Crea regex per trovare città (case insensitive, con spazi opzionali)
      const cityRegex = new RegExp(
        `,\\s*(${cities.join("|").replace(/\./g, "\\.")})\\s*$`,
        "i"
      );
      const cityMatch = palestra.match(cityRegex);

      if (cityMatch) {
        const city = cityMatch[1].trim();
        // Converti "TO" in "Torino"
        const fullCity = city.toUpperCase() === "TO" ? "Torino" : city;
        address += `, ${fullCity}, Italia`;
      } else {
        // Se non c'è città, aggiungi Italia per sicurezza
        address += ", Italia";
      }

      return address;
    }
  }

  // Se non trova pattern specifici, ritorna pulito
  // Rimuovi prefissi comuni come "Scuola", "Palestra", ecc.
  cleaned = cleaned.replace(
    /^(Scuola|Palestra|Istituto|I\.C\.|IC|Pal\.|Pal\.Com\.|Ist\.)\s+[^-]+\s*-\s*/i,
    ""
  );

  // Aggiungi Italia alla fine se non c'è già
  if (!cleaned.toLowerCase().includes("italia")) {
    cleaned += ", Italia";
  }

  return cleaned;
}

/**
 * Genera link Google Maps dalla palestra
 * Usa pulizia intelligente dell'indirizzo per risultati accurati
 */
export function getGoogleMapsLink(palestra: string): string {
  const cleanedAddress = cleanAddress(palestra);
  const query = encodeURIComponent(cleanedAddress);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
