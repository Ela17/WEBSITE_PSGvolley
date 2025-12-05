export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ [lib/env.ts] Variabile mancante: ${key}`);
    console.error('Variabili disponibili:', Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('_')).slice(0, 20));
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// Decodifica Base64 dell'hash password
function decodePasswordHash(): string {
  console.log('🔍 [lib/env.ts] Decodifica hash password...');
  const base64Hash = getEnv('ADMIN_PASSWORD_HASH_BASE64');
  console.log('  Base64 trovato, lunghezza:', base64Hash.length);
  
  const decoded = Buffer.from(base64Hash, 'base64').toString('utf-8');
  console.log('  Hash decodificato, lunghezza:', decoded.length);
  console.log('  Inizia con $2b$?', decoded.startsWith('$2b$') ? '✅' : '❌');
  
  return decoded;
}

console.log('🔐 [lib/env.ts] Caricamento AUTH_CONFIG...');
export const AUTH_CONFIG = {
  sessionSecret: getEnv('SESSION_SECRET'),
  adminUsername: getEnv('ADMIN_USERNAME'),
  adminPasswordHash: decodePasswordHash(), // Decodifica da Base64
};
console.log('✅ [lib/env.ts] AUTH_CONFIG caricato con successo');
console.log('  Username:', AUTH_CONFIG.adminUsername);
console.log('  Hash (primi 20 char):', AUTH_CONFIG.adminPasswordHash.substring(0, 20));