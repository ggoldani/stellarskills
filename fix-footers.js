import fs from 'fs';
import path from 'path';

const skillsDirs = fs.readdirSync('.', { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'bin' && dirent.name !== 'node_modules')
  .map(dirent => dirent.name);

const filesToProcess = ['SKILL.md', ...skillsDirs.map(d => `${d}/SKILL.md`)];

for (const file of filesToProcess) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');

  // Strip existing footer
  const footerRegex = /\n\n---\n\n\*raw\.githubusercontent\.com\/ggoldani\/stellarskills\/main.*— MIT License\*\n?$/;
  content = content.replace(footerRegex, '').trimEnd();

  // Determine path component for footer
  const dirname = file === 'SKILL.md' ? '' : `/${path.dirname(file)}`;

  // Append standardized footer
  const newFooter = `\n\n---\n\n*raw.githubusercontent.com/ggoldani/stellarskills/main${dirname} — MIT License*\n`;
  fs.writeFileSync(file, content + newFooter);
  console.log(`Updated footer for ${file}`);
}
