import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';

const source = 'Amanah Center - Rogi Management.html';
const target = 'public/index.html';

if (!existsSync(source)) {
  throw new Error('Amanah Management source HTML is missing.');
}
if (statSync(source).size < 100_000) {
  throw new Error('Amanah Management source HTML appears incomplete.');
}
mkdirSync('public', { recursive: true });
copyFileSync(source, target);
console.log('Amanah Management: static index.html built (' + statSync(target).size + ' bytes)');
