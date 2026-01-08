export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ [lib/env.ts] Variabile mancante: ${key}`);
    console.error(
      "Variabili disponibili:",
      Object.keys(process.env)
        .filter((k) => !k.startsWith("npm_") && !k.startsWith("_"))
        .slice(0, 20)
    );
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

// Decodifica Base64 dell'hash password
function decodePasswordHash(): string {
  const base64Hash = getEnv("ADMIN_PASSWORD_HASH_BASE64");

  const decoded = Buffer.from(base64Hash, "base64").toString("utf-8");

  return decoded;
}

export const AUTH_CONFIG = {
  sessionSecret: getEnv("SESSION_SECRET"),
  adminUsername: getEnv("ADMIN_USERNAME"),
  adminPasswordHash: decodePasswordHash(), // Decodifica da Base64
};
