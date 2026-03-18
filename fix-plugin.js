import fs from 'fs';
import path from 'path';

const pluginPath = '.claude-plugin/plugin.json';
const pluginJson = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));

// Filter out old dynamic skills, keep stellar-expert
pluginJson.skills = pluginJson.skills.filter(s => s.name === 'stellar-expert');

const dirs = fs.readdirSync('.', { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'bin' && d.name !== 'node_modules')
  .map(d => d.name);

const files = ['SKILL.md', ...dirs.map(d => `${d}/SKILL.md`)];

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const fm = match[1];
    const nameMatch = fm.match(/^name:\s*(.*)$/m);
    const descMatch = fm.match(/^description:\s*(.*)$/m);

    if (nameMatch && descMatch) {
      const name = nameMatch[1].trim();
      const description = descMatch[1].trim();
      const skillPath = `../${file}`;

      pluginJson.skills.push({
        name,
        description,
        path: skillPath
      });
    }
  }
}

fs.writeFileSync(pluginPath, JSON.stringify(pluginJson, null, 2) + '\n');
console.log('Updated plugin.json');
