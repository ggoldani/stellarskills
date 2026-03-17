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
  list         List all available skills.
  get <skill>  Print the raw Markdown content of a specific skill.
  url <skill>  Print the direct raw GitHub URL of a specific skill.

Examples:
  npx stellarskills list
  npx stellarskills get soroban
  npx stellarskills url accounts
  npx stellarskills get root
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
