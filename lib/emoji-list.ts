/**
 * Lista emoji per il WYSIWYG editor
 * Contestualizzata per PSG Volley
 */

export const EMOJI_LIST = [
  // Faccine base
  "😊", "😂", "🤣", "😍", "🥳", "😅", "🤔", "😢", "😤", "😎",
  // Sport e vittoria
  "🏐", "🏆", "🥇", "🥈", "🥉", "💪", "⭐", "🎯", "🔥", "✨",
  // Celebrazioni
  "🎉", "👏", "👍", "👎", "❤️", "💙", "🙏", "🤝", "✌️", "👊",
  // Utili
  "✅", "❌", "⚠️", "📅", "📍", "➡️", "⬆️", "⬇️", "💬", "📣",
] as const;

export type Emoji = (typeof EMOJI_LIST)[number];