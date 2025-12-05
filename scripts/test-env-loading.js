#!/usr/bin/env node

/**
 * Test di caricamento variabili d'ambiente
 */

console.log('\n🔍 Test Caricamento Variabili d\'Ambiente\n');
console.log('='.repeat(60));

// Test 1: Caricamento automatico Next.js
console.log('\n1️⃣  Variabili senza dotenv (come fa Next.js):');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ PRESENTE' : '❌ MANCANTE');
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME ? '✅ PRESENTE' : '❌ MANCANTE');
console.log('ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH ? '✅ PRESENTE' : '❌ MANCANTE');

// Test 2: Caricamento con dotenv
console.log('\n2️⃣  Caricamento con dotenv:');
const path = require('path');
const fs = require('fs');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

console.log('Cerco .env.local in:', envLocalPath);
console.log('.env.local exists?', fs.existsSync(envLocalPath) ? '✅ SI' : '❌ NO');

console.log('Cerco .env in:', envPath);
console.log('.env exists?', fs.existsSync(envPath) ? '✅ SI' : '❌ NO');

if (fs.existsSync(envLocalPath)) {
  console.log('\n📄 Contenuto .env.local:');
  const content = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      console.log(`  Linea ${idx + 1}: ${key}=***`);
    }
  });
  
  // Prova a caricare con dotenv
  require('dotenv').config({ path: envLocalPath });
  
  console.log('\n3️⃣  Dopo caricamento dotenv:');
  console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ PRESENTE' : '❌ MANCANTE');
  console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME ? '✅ PRESENTE' : '❌ MANCANTE');
  console.log('ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH ? '✅ PRESENTE' : '❌ MANCANTE');
} else {
  console.log('\n❌ File .env.local NON TROVATO nella root del progetto!');
  console.log('Posizione attuale:', process.cwd());
  console.log('\nCrealo con:');
  console.log('cat > .env.local << EOF');
  console.log('SESSION_SECRET=85zioIrgZP2/u32mwNjIyUxJh/CJ8NUpfa0r3763pTI=');
  console.log('ADMIN_USERNAME=admin_psg');
  console.log('ADMIN_PASSWORD_HASH=$2b$10$xfP2UraQwNnjRY01vyUAFePbYJ9FdWCrYp5FaKRZYdfYssbBpnEZ6');
  console.log('EOF');
}

console.log('\n' + '='.repeat(60));