/**
 * Script per generare hash bcrypt delle password per l'admin
 * 
 * Uso:
 *   node scripts/hash-password.js your-password
 * 
 * Oppure eseguire senza argomenti per inserire interattivamente:
 *   node scripts/hash-password.js
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Password fornita come argomento
    const password = args[0];
    const hash = await hashPassword(password);
    console.log('\n✅ Hash generato con successo!\n');
    console.log('Aggiungi questa riga al tuo file .env.local:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Inserisci la password da hashare: ', async (password) => {
      if (!password || password.trim().length === 0) {
        console.error('\n❌ Errore: la password non può essere vuota');
        rl.close();
        process.exit(1);
      }

      const hash = await hashPassword(password);
      console.log('\n✅ Hash generato con successo!\n');
      console.log('Aggiungi questa riga al tuo file .env.local:\n');
      console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
      rl.close();
    });
  }
}

main().catch(err => {
  console.error('❌ Errore:', err);
  process.exit(1);
});