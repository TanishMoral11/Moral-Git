#!/usr/bin/env node
const { execSync } = require('child_process');
const { program } = require('commander');

// Helper: run a shell command and return output
function run(cmd, options = {}) {
  return execSync(cmd, { encoding: 'utf-8', ...options }).trim();
}

// Helper: get current branch name
function getCurrentBranch() {
  return run('git rev-parse --abbrev-ref HEAD');
}

// Helper: check if inside a git repo
function isGitRepo() {
  try {
    run('git rev-parse --is-inside-work-tree');
    return true;
  } catch {
    return false;
  }
}

program
  .name('gitgo')
  .description('A CLI tool to automate Git commands — by Tanish Moral')
  .version('1.1.0');

// ─── Default: push command ────────────────────────────────────────
program
  .command('push <message>')
  .description('Stage all changes, commit with a message, and push to remote')
  .option('-b, --branch <branch>', 'Target branch to push to (defaults to current branch)')
  .action((message, options) => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    const branch = options.branch || getCurrentBranch();
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      execSync(`git push origin ${branch}`, { stdio: 'inherit' });
      console.log(`\n✅ Code pushed to '${branch}' successfully!`);
    } catch (error) {
      console.error('\n❌ Push failed:', error.message);
    }
  });

// ─── Quick push (shorthand — no subcommand needed) ───────────────
program
  .argument('[message]', 'Commit message (shorthand for "gitgo push")')
  .action((message) => {
    if (!message) return; // let commander handle help
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    const branch = getCurrentBranch();
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      execSync(`git push origin ${branch}`, { stdio: 'inherit' });
      console.log(`\n✅ Code pushed to '${branch}' successfully!`);
    } catch (error) {
      console.error('\n❌ Push failed:', error.message);
    }
  });

// ─── Status ───────────────────────────────────────────────────────
program
  .command('status')
  .alias('s')
  .description('Show git status in a clean format')
  .action(() => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    execSync('git status -sb', { stdio: 'inherit' });
  });

// ─── Log ──────────────────────────────────────────────────────────
program
  .command('log')
  .alias('l')
  .description('Show recent commit history (last 10 commits)')
  .option('-n, --number <count>', 'Number of commits to show', '10')
  .action((options) => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    execSync(
      `git log --oneline --graph --decorate -n ${options.number}`,
      { stdio: 'inherit' }
    );
  });

// ─── Undo last commit ────────────────────────────────────────────
program
  .command('undo')
  .description('Undo the last commit but keep the changes staged')
  .action(() => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    try {
      execSync('git reset --soft HEAD~1', { stdio: 'inherit' });
      console.log('✅ Last commit undone. Your changes are still staged.');
    } catch (error) {
      console.error('❌ Undo failed:', error.message);
    }
  });

// ─── Create & switch to a new branch ─────────────────────────────
program
  .command('branch <name>')
  .alias('b')
  .description('Create and switch to a new branch')
  .action((name) => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    try {
      execSync(`git checkout -b ${name}`, { stdio: 'inherit' });
      console.log(`✅ Switched to new branch '${name}'.`);
    } catch (error) {
      console.error('❌ Branch creation failed:', error.message);
    }
  });

// ─── Switch to an existing branch ────────────────────────────────
program
  .command('switch <name>')
  .alias('sw')
  .description('Switch to an existing branch')
  .action((name) => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    try {
      execSync(`git checkout ${name}`, { stdio: 'inherit' });
      console.log(`✅ Switched to branch '${name}'.`);
    } catch (error) {
      console.error('❌ Switch failed:', error.message);
    }
  });

// ─── Pull latest changes ─────────────────────────────────────────
program
  .command('pull')
  .alias('p')
  .description('Pull latest changes from remote')
  .action(() => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    const branch = getCurrentBranch();
    try {
      execSync(`git pull origin ${branch}`, { stdio: 'inherit' });
      console.log(`\n✅ Pulled latest changes from '${branch}'.`);
    } catch (error) {
      console.error('\n❌ Pull failed:', error.message);
    }
  });

// ─── Stash changes ───────────────────────────────────────────────
program
  .command('save [message]')
  .description('Stash your uncommitted changes with an optional message')
  .action((message) => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    try {
      const cmd = message ? `git stash push -m "${message}"` : 'git stash';
      execSync(cmd, { stdio: 'inherit' });
      console.log('✅ Changes stashed successfully.');
    } catch (error) {
      console.error('❌ Stash failed:', error.message);
    }
  });

// ─── Pop stashed changes ─────────────────────────────────────────
program
  .command('load')
  .description('Restore the most recently stashed changes')
  .action(() => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    try {
      execSync('git stash pop', { stdio: 'inherit' });
      console.log('✅ Stashed changes restored.');
    } catch (error) {
      console.error('❌ Stash pop failed:', error.message);
    }
  });

// ─── Diff ─────────────────────────────────────────────────────────
program
  .command('diff')
  .alias('d')
  .description('Show unstaged changes')
  .action(() => {
    if (!isGitRepo()) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }
    execSync('git diff', { stdio: 'inherit' });
  });

// ─── Clone a repo ─────────────────────────────────────────────────
program
  .command('clone <url>')
  .description('Clone a remote repository')
  .action((url) => {
    try {
      execSync(`git clone ${url}`, { stdio: 'inherit' });
      console.log('\n✅ Repository cloned successfully!');
    } catch (error) {
      console.error('\n❌ Clone failed:', error.message);
    }
  });

// ─── Init a new repo ──────────────────────────────────────────────
program
  .command('init')
  .description('Initialize a new git repository')
  .action(() => {
    try {
      execSync('git init', { stdio: 'inherit' });
      console.log('✅ Git repository initialized.');
    } catch (error) {
      console.error('❌ Init failed:', error.message);
    }
  });

program.parse();

