#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REPO_BASE_URL = 'https://raw.githubusercontent.com/ggoldani/stellarskills/main';

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
🚀 StellarSkills CLI

Usage:
  stellarskills <command> [arguments]

Commands:
  list                           List all available skills.
  get <skill>                    Print the raw Markdown content of a specific skill.
  url <skill>                    Print the direct raw GitHub URL of a specific skill.
  combine <skill1> [skill2] ...  Combine multiple skills into a single Markdown output.
  search "<query>"               Search across all skills for a specific term.

Examples:
  npx stellarskills list
  npx stellarskills get soroban
  npx stellarskills url accounts
  npx stellarskills combine accounts soroban security > prompt.txt
  npx stellarskills search "trustline"
`);
}

function getAvailableSkills() {
  const skills = ['root']; // Base skill file at root

  try {
    const items = fs.readdirSync(rootDir);
    for (const item of items) {
      if (item === 'node_modules' || item === 'bin' || item.startsWith('.')) continue;

      const fullPath = path.join(rootDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        const skillFilePath = path.join(fullPath, 'SKILL.md');
        if (fs.existsSync(skillFilePath)) {
          skills.push(item);
        }
      }
    }
  } catch (error) {
    console.error('Error reading skills directory:', error.message);
  }

  return skills;
}

function handleList() {
  const skills = getAvailableSkills();
  console.log('📚 Available Stellar Skills:\n');
  skills.forEach(skill => {
    console.log(`  - ${skill}`);
  });
  console.log('\nRun `stellarskills get <skill>` to output its content.');
}

function getSkillPath(skill) {
  if (skill === 'root') {
    return path.join(rootDir, 'SKILL.md');
  }
  return path.join(rootDir, skill, 'SKILL.md');
}

function handleGet(skill) {
  if (!skill) {
    console.error('Error: You must provide a skill name.\nExample: stellarskills get soroban');
    process.exit(1);
  }

  const skillPath = getSkillPath(skill);
  if (fs.existsSync(skillPath)) {
    const content = fs.readFileSync(skillPath, 'utf-8');
    console.log(content);
  } else {
    console.error(`Error: Skill '${skill}' not found.`);
    console.log('Run `stellarskills list` to see available skills.');
    process.exit(1);
  }
}

function handleUrl(skill) {
  if (!skill) {
    console.error('Error: You must provide a skill name.\nExample: stellarskills url soroban');
    process.exit(1);
  }

  const availableSkills = getAvailableSkills();
  if (!availableSkills.includes(skill)) {
    console.error(`Error: Skill '${skill}' not found.`);
    console.log('Run `stellarskills list` to see available skills.');
    process.exit(1);
  }

  if (skill === 'root') {
    console.log(`${REPO_BASE_URL}/SKILL.md`);
  } else {
    console.log(`${REPO_BASE_URL}/${skill}/SKILL.md`);
  }
}

function handleCombine(requestedSkills) {
  if (!requestedSkills || requestedSkills.length === 0) {
    console.error('Error: You must provide at least one skill name to combine.\nExample: stellarskills combine accounts soroban security');
    process.exit(1);
  }

  const availableSkills = getAvailableSkills();
  const missingSkills = requestedSkills.filter(skill => !availableSkills.includes(skill));

  if (missingSkills.length > 0) {
    console.error(`Error: The following requested skills were not found: ${missingSkills.join(', ')}`);
    console.log('Run `stellarskills list` to see available skills.');
    process.exit(1);
  }

  const contents = requestedSkills.map(skill => {
    const skillPath = getSkillPath(skill);
    try {
      return fs.readFileSync(skillPath, 'utf-8');
    } catch (e) {
      console.error(`Error: Could not read file for skill '${skill}': ${e.message}`);
      process.exit(1);
    }
  });

  const separator = '\n\n--------------------------------------------------------------------------------\n\n';
  const combinedOutput = contents.join(separator);

  console.log(combinedOutput);
}

function handleSearch(query) {
  if (!query) {
    console.error('Error: You must provide a search query.\nExample: stellarskills search "trustline"');
    process.exit(1);
  }

  const availableSkills = getAvailableSkills();
  const lowerQuery = query.toLowerCase();
  let foundAny = false;

  console.log(`\n🔍 Searching for "${query}"...\n`);

  for (const skill of availableSkills) {
    const skillPath = getSkillPath(skill);
    try {
      const content = fs.readFileSync(skillPath, 'utf-8');
      if (content.toLowerCase().includes(lowerQuery)) {
        console.log(`  ✅ Found in: ${skill}`);
        foundAny = true;
      }
    } catch (e) {
      // Gracefully skip files that cannot be read
    }
  }

  if (!foundAny) {
    console.log(`  ❌ No results found across available skills.`);
  }

  console.log(); // Trailing newline for clean output
}

const command = args[0];

switch (command) {
  case 'list':
    handleList();
    break;
  case 'get':
    handleGet(args[1]);
    break;
  case 'url':
    handleUrl(args[1]);
    break;
  case 'combine':
    handleCombine(args.slice(1));
    break;
  case 'search':
    handleSearch(args[1]);
    break;
  case 'help':
  case '--help':
  case '-h':
  default:
    if (command && command !== 'help' && command !== '--help' && command !== '-h') {
      console.error(`Unknown command: ${command}`);
    }
    printHelp();
    break;
}
