/**
 * Script per generare hash password in formato Base64
 * Uso: node scripts/generate-hash-base64.js <password>
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

async function generateHash() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Leggi password (se non passata come argomento)
  const password = process.argv[2] || await new Promise(resolve => {
    rl.question('Inserisci la password: ', resolve);
  });

  rl.close();

  console.log('\n🔐 Generazione hash...\n');

  // Genera hash bcrypt
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('Hash bcrypt originale:');
  console.log(hash);
  console.log('');

  // Converti in Base64
  const base64Hash = Buffer.from(hash).toString('base64');
  
  console.log('Hash Base64 (da usare in .env):');
  console.log(base64Hash);
  console.log('');
  
  console.log('✅ Copia questa riga nel file .env:');
  console.log(`ADMIN_PASSWORD_HASH_BASE64=${base64Hash}`);
  console.log('');
  
  // Verifica
  const decoded = Buffer.from(base64Hash, 'base64').toString('utf-8');
  const isValid = await bcrypt.compare(password, decoded);
  
  console.log('🔍 Verifica:');
  console.log('Decodifica corretta:', decoded === hash ? '✅' : '❌');
  console.log('Password valida:', isValid ? '✅' : '❌');
}

generateHash().catch(console.error);