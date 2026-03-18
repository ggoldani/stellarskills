import fs from 'fs';

const readmePath = 'README.md';
let content = fs.readFileSync(readmePath, 'utf8');

const dirs = fs.readdirSync('.', { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'bin' && d.name !== 'node_modules')
  .map(d => d.name)
  .sort(); // sort alphabetically

const files = ['SKILL.md', ...dirs.map(d => `${d}/SKILL.md`)];

let newTable = '| Skill Domain | URL | Description |\n';
newTable += '|--------------|-----|-------------|\n';

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let fileContent = fs.readFileSync(file, 'utf8');
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = fileContent.match(frontmatterRegex);

  if (match) {
    const fm = match[1];
    const descMatch = fm.match(/^description:\s*(.*)$/m);

    if (descMatch) {
      const description = descMatch[1].trim();
      let domainName = '';
      let urlPath = '';

      if (file === 'SKILL.md') {
        domainName = 'Root Index';
        urlPath = 'SKILL.md';
      } else {
        const dir = file.split('/')[0];
        // Capitalize dir name or use mapping
        const nameMap = {
          'dex': 'DEX & AMM',
          'seps': 'SEPs',
          'x402': 'x402',
          'openzeppelin': 'OpenZeppelin',
          'rpc': 'Soroban RPC',
          'horizon': 'Horizon API',
          'why': 'Why Stellar?',
          'local-node': 'Local Node',
          'frontend': 'Frontend'
        };
        domainName = nameMap[dir] || (dir.charAt(0).toUpperCase() + dir.slice(1));
        urlPath = `${dir}/SKILL.md`;
      }

      newTable += `| **${domainName}** | \`raw.githubusercontent.com/ggoldani/stellarskills/main/${urlPath}\` | ${description} |\n`;
    }
  }
}

const sectionRegex = /(## 📚 The Skill Index\n\n)[\s\S]*?(\n\n---)/;
if (sectionRegex.test(content)) {
  content = content.replace(sectionRegex, `$1${newTable.trim()}$2`);
  fs.writeFileSync(readmePath, content);
  console.log('Updated README.md Skill Index table');
} else {
  console.error('Could not find section to replace in README.md');
}
