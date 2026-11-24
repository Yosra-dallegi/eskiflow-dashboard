// Lanceur automatique vers server.ts pour toujours exécuter la dernière logique métier
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverTs = path.resolve(__dirname, 'server.ts');

console.log('[Eskiflow] Démarrage du serveur via tsx:', serverTs);
const child = spawn('npx', ['tsx', serverTs], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
