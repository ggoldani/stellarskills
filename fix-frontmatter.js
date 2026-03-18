import fs from 'fs';
import path from 'path';

const dirs = fs.readdirSync('.', { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'bin' && d.name !== 'node_modules')
  .map(d => d.name);

const files = ['SKILL.md', ...dirs.map(d => `${d}/SKILL.md`)];

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');

  // Parse blockquote description (first `> `)
  const lines = content.split('\n');
  let blockquoteDescription = '';
  for (const line of lines) {
    if (line.trim().startsWith('> ')) {
      blockquoteDescription = line.trim().substring(2).trim();
      break;
    }
  }

  if (blockquoteDescription) {
    // Update frontmatter description
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = content.match(frontmatterRegex);

    if (match) {
      let fm = match[1];
      fm = fm.replace(/^description:.*$/m, `description: ${blockquoteDescription}`);
      content = content.replace(frontmatterRegex, `---\n${fm}\n---\n`);
      fs.writeFileSync(file, content);
      console.log(`Updated frontmatter for ${file}`);
    }
  }
}
