#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

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
  copy <skill1> [skill2] ...     Copy combined skills directly to your system clipboard.
  rules <ide> <skill1> ...       Append combined skills directly to your .cursorrules, .clinerules, or .windsurfrules.
  index                          Output a full, agent-friendly Markdown map of all skills and their descriptions.
  doctor                         Verify if your local environment is ready for Stellar and Soroban development.
  system <skills> [--instruction] Output the ultimate AI System Prompt containing an expert persona and requested skills.

Examples:
  npx stellarskills list
  npx stellarskills get soroban
  npx stellarskills url accounts
  npx stellarskills combine accounts soroban security > prompt.txt
  npx stellarskills search "trustline"
  npx stellarskills copy dex
  npx stellarskills rules cursor accounts soroban
  npx stellarskills index
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

function readSkillContent(skillPath) {
  let content = fs.readFileSync(skillPath, 'utf-8');
  // Strip YAML frontmatter if it exists, handling both \n and \r\n
  const frontmatterRegex = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
  if (frontmatterRegex.test(content)) {
    content = content.replace(frontmatterRegex, '').trimStart();
  }
  return content;
}

function handleGet(skill) {
  if (!skill) {
    console.error('Error: You must provide a skill name.\nExample: stellarskills get soroban');
    process.exit(1);
  }

  const availableSkills = getAvailableSkills();
  if (!availableSkills.includes(skill)) {
    console.error(`Error: Skill '${skill}' not found.`);
    console.log('Run `stellarskills list` to see available skills.');
    process.exit(1);
  }

  const skillPath = getSkillPath(skill);
  if (fs.existsSync(skillPath)) {
    const content = readSkillContent(skillPath);
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
      return readSkillContent(skillPath);
    } catch (e) {
      console.error(`Error: Could not read file for skill '${skill}': ${e.message}`);
      process.exit(1);
    }
  });

  const separator = '\n\n--------------------------------------------------------------------------------\n\n';
  const combinedOutput = contents.join(separator);

  console.log(combinedOutput);
}

function handleCopy(requestedSkills) {
  if (!requestedSkills || requestedSkills.length === 0) {
    console.error('Error: You must provide at least one skill name to copy.\nExample: stellarskills copy accounts soroban');
    process.exit(1);
  }

  const availableSkills = getAvailableSkills();
  const missingSkills = requestedSkills.filter(skill => !availableSkills.includes(skill));

  if (missingSkills.length > 0) {
    console.error(`Error: The following requested skills were not found: ${missingSkills.join(', ')}`);
    process.exit(1);
  }

  const contents = requestedSkills.map(skill => {
    try {
      return readSkillContent(getSkillPath(skill));
    } catch (e) {
      console.error(`Error: Could not read file for skill '${skill}': ${e.message}`);
      process.exit(1);
    }
  });

  const separator = '\n\n--------------------------------------------------------------------------------\n\n';
  const combinedOutput = contents.join(separator);

  let command;
  switch (process.platform) {
    case 'darwin':
      command = 'pbcopy';
      break;
    case 'win32':
      command = 'clip';
      break;
    case 'linux':
      // Fallback xclip for linux. If missing, it will error out cleanly.
      command = 'xclip -selection clipboard';
      break;
    default:
      console.error('Error: Clipboard copy is not supported on this operating system.');
      process.exit(1);
  }

  try {
    const child = spawn(command, { shell: true, stdio: ['pipe', 'ignore', 'ignore'] });
    child.stdin.write(combinedOutput);
    child.stdin.end();

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Copied the raw Markdown for [${requestedSkills.join(', ')}] to your clipboard.\n`);
      } else {
        console.error(`\n❌ Failed to copy to clipboard. Ensure '${command}' is installed on your system.\n`);
      }
    });
  } catch (error) {
    console.error(`\n❌ Failed to copy to clipboard: ${error.message}\n`);
  }
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

function handleRules(ide, requestedSkills) {
  if (!ide || !requestedSkills || requestedSkills.length === 0) {
    console.error('Error: You must provide an IDE and at least one skill.\nExample: stellarskills rules cursor accounts soroban');
    process.exit(1);
  }

  const supportedIdes = {
    'cursor': '.cursorrules',
    'cline': '.clinerules',
    'windsurf': '.windsurfrules'
  };

  const filename = supportedIdes[ide.toLowerCase()];
  if (!filename) {
    console.error(`Error: Unsupported IDE '${ide}'. Supported IDEs are: ${Object.keys(supportedIdes).join(', ')}`);
    process.exit(1);
  }

  const availableSkills = getAvailableSkills();
  const missingSkills = requestedSkills.filter(skill => !availableSkills.includes(skill));

  if (missingSkills.length > 0) {
    console.error(`Error: The following requested skills were not found: ${missingSkills.join(', ')}`);
    process.exit(1);
  }

  const contents = requestedSkills.map(skill => {
    try {
      return readSkillContent(getSkillPath(skill));
    } catch (e) {
      console.error(`Error: Could not read file for skill '${skill}': ${e.message}`);
      process.exit(1);
    }
  });

  const separator = '\n\n--------------------------------------------------------------------------------\n\n';
  const combinedOutput = separator + contents.join(separator) + '\n';
  const targetPath = path.join(process.cwd(), filename);

  try {
    fs.appendFileSync(targetPath, combinedOutput, 'utf-8');
    console.log(`\n✅ Appended Stellar knowledge [${requestedSkills.join(', ')}] to ${filename} in the current directory.\n`);
  } catch (error) {
    console.error(`\n❌ Failed to write to ${filename}: ${error.message}\n`);
    process.exit(1);
  }
}

function handleIndex() {
  const availableSkills = getAvailableSkills();
  console.log('## StellarSkills Index\n');

  availableSkills.forEach(skill => {
    const skillPath = getSkillPath(skill);
    let description = 'No description available.';

    try {
      const content = fs.readFileSync(skillPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('> ')) {
          // Remove the '> ' prefix
          description = line.trim().substring(2).trim();
          break;
        }
      }
    } catch (e) {
      // Ignore read errors
    }

    console.log(`- **${skill}**: ${description}`);
  });
  console.log();
}

function handleDoctor() {
  console.log('🩺 StellarSkills Environment Doctor\n');
  console.log('Checking your system for required Stellar & Soroban tools...\n');

  const checks = [
    { name: 'Node.js', cmd: 'node -v', isRequired: true },
    { name: 'Rust Compiler', cmd: 'rustc --version', isRequired: true },
    { name: 'Cargo', cmd: 'cargo --version', isRequired: true },
    { name: 'Stellar CLI', cmd: 'stellar --version', isRequired: true },
    { name: 'WASM Target (wasm32-unknown-unknown)', cmd: 'rustup target list', isRequired: true, validator: (out) => out.includes('wasm32-unknown-unknown (installed)') }
  ];

  let allPassed = true;

  checks.forEach(check => {
    try {
      // Execute the command synchronously
      const output = execSync(check.cmd, { stdio: 'pipe', encoding: 'utf-8' }).trim();

      // If a custom validator exists, run it
      if (check.validator && !check.validator(output)) {
        throw new Error('Validation failed');
      }

      // Keep output concise (first line only unless validator is used)
      let shortOutput = output.split('\n')[0];
      if (check.validator) {
          shortOutput = 'installed';
      }

      console.log(`✅ [Installed] ${check.name}: ${shortOutput}`);
    } catch (error) {
      console.log(`❌ [Missing]   ${check.name}`);
      if (check.isRequired) {
        allPassed = false;
      }
    }
  });

  console.log('\n---');
  if (allPassed) {
    console.log('🎉 Your environment is fully configured to build on Stellar & Soroban!');
  } else {
    console.log('⚠️  Your environment is missing required dependencies.');
    console.log('👉 Agents: Please install the missing tools using `cargo install --locked stellar-cli` or `rustup target add wasm32-unknown-unknown` before attempting to compile contracts.');
  }
}

function handleSystem(argsArray) {
  let requestedSkills = [];
  let instruction = '';

  // Parse arguments to separate skills and the optional --instruction flag
  for (let i = 0; i < argsArray.length; i++) {
    if (argsArray[i] === '--instruction') {
      if (i + 1 < argsArray.length) {
        instruction = argsArray[i + 1];
        i++; // skip the instruction text
      } else {
        console.error('Error: --instruction requires a string argument.');
        process.exit(1);
      }
    } else {
      requestedSkills.push(argsArray[i]);
    }
  }

  if (requestedSkills.length === 0) {
    console.error('Error: You must provide at least one skill name.\nExample: stellarskills system soroban dex --instruction "Create an AMM pool"');
    process.exit(1);
  }

  const availableSkills = getAvailableSkills();
  const missingSkills = requestedSkills.filter(skill => !availableSkills.includes(skill));

  if (missingSkills.length > 0) {
    console.error(`Error: The following requested skills were not found: ${missingSkills.join(', ')}`);
    process.exit(1);
  }

  const contents = requestedSkills.map(skill => {
    try {
      return readSkillContent(getSkillPath(skill));
    } catch (e) {
      console.error(`Error: Could not read file for skill '${skill}': ${e.message}`);
      process.exit(1);
    }
  });

  const separator = '\n\n--------------------------------------------------------------------------------\n\n';
  const combinedKnowledge = contents.join(separator);

  const expertPersona = `You are an expert software engineer specializing in the Stellar Network and Soroban smart contracts.
You must strictly adhere to the following architectural rules:
1. Stellar uses typed Operations, not EVM calldata.
2. Smart contracts are written in memory-safe Rust and compiled to WASM.
3. You must always use the \`stellar-cli\` tool to build, simulate, and deploy contracts. You must NEVER use the deprecated \`soroban-cli\`.
4. You must never invent or hallucinate EVM-like concepts (like msg.sender or Solidity mappings) when writing Soroban.

Below is your verified knowledge base to complete the user's task. Read it carefully.

### STELLAR KNOWLEDGE BASE:

${combinedKnowledge}
`;

  let finalOutput = expertPersona;

  if (instruction) {
    finalOutput += `\n### YOUR TASK:\n\n${instruction}\n`;
  }

  console.log(finalOutput);
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
  case 'copy':
    handleCopy(args.slice(1));
    break;
  case 'rules':
    handleRules(args[1], args.slice(2));
    break;
  case 'index':
    handleIndex();
    break;
  case 'doctor':
    handleDoctor();
    break;
  case 'system':
    handleSystem(args.slice(1));
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
