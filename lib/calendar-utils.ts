/**
 * Utility functions for calendar component
 */

import { CalendarEvent, parseItalianDate } from "@/lib/campionato-types";

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

/**
 * Converte data e ora di una partita in stringa ICS (formato YYYYMMDDTHHmmss)
 */
function toIcsDateTime(dateStr: string, oraStr: string): string {
  const date = parseItalianDate(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Ora: "21.00" o "21:00" → ore/minuti
  let hours = "20";
  let minutes = "00";
  if (oraStr) {
    const normalized = oraStr.replace(".", ":").replace(",", ":");
    const parts = normalized.split(":");
    hours = String(parseInt(parts[0] || "20", 10)).padStart(2, "0");
    minutes = String(parseInt(parts[1] || "00", 10)).padStart(2, "0");
  }

  return `${year}${month}${day}T${hours}${minutes}00`;
}

/**
 * Aggiunge 2 ore a una stringa ICS datetime
 */
function addTwoHours(icsDateTime: string): string {
  // Formato: YYYYMMDDTHHmmss
  const hours = parseInt(icsDateTime.slice(9, 11), 10);
  const endHours = String((hours + 2) % 24).padStart(2, "0");
  return icsDateTime.slice(0, 9) + endHours + icsDateTime.slice(11);
}

/**
 * Genera il contenuto di un file .ics per un insieme di eventi PSG
 */
export function generateICS(events: CalendarEvent[], calendarName: string): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PSG Volley//Campionato UISP//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    "X-WR-TIMEZONE:Europe/Rome",
  ];

  for (const event of events) {
    if (!event.data) continue;
    const dtStart = toIcsDateTime(event.data, event.ora);
    const dtEnd = addTwoHours(dtStart);
    const categLabel = event.categoria === "master" ? "Master 4+2" : "Open 3×3";
    const summary = `${event.squadraA} vs ${event.squadraB} (${categLabel})`;
    const descParts = [`Campionato ${categLabel}`, `Gara #${event.id}`];
    if (event.palestra) descParts.push(`Palestra: ${event.palestra}`);
    if (event.note) descParts.push(`Note: ${event.note}`);
    const description = descParts.join("\\n");
    const rawLoc = event.indirizzo_maps || event.palestra || "";
    const location = rawLoc
      ? rawLoc.toLowerCase().includes("italia")
        ? rawLoc
        : `${rawLoc}, Italia`
      : "";
    const uid = `psg-campionato-${event.id}@psgsangiuseppe.it`;

    lines.push("BEGIN:VEVENT");
    lines.push(`DTSTART;TZID=Europe/Rome:${dtStart}`);
    lines.push(`DTEND;TZID=Europe/Rome:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${description}`);
    if (location) lines.push(`LOCATION:${location}`);
    lines.push(`UID:${uid}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Genera un link diretto per aggiungere una singola partita a Google Calendar.
 * Apre calendar.google.com precompilato — nessun file da scaricare.
 */
export function getGoogleCalendarLink(event: CalendarEvent): string {
  const dtStart = toIcsDateTime(event.data, event.ora);
  const dtEnd = addTwoHours(dtStart);
  const categLabel = event.categoria === "master" ? "Master 4+2" : "Open 3×3";
  const title = `${event.squadraA} vs ${event.squadraB} (${categLabel})`;
  const descParts = [`Campionato ${categLabel}`, `Gara #${event.id}`];
  if (event.note) descParts.push(`Note: ${event.note}`);
  const details = descParts.join("\n");
  const rawLocation = event.indirizzo_maps || event.palestra || "";
  const location = rawLocation
    ? rawLocation.toLowerCase().includes("italia")
      ? rawLocation
      : `${rawLocation}, Italia`
    : "";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dtStart}/${dtEnd}`,
    details,
    ...(location ? { location } : {}),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Scarica un file .ics nel browser
 */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
