#!/usr/bin/env node
const { execSync } = require('child_process');
const { program } = require('commander');

// Define the command
program
  .argument('<message>', 'Commit message')
  .action((message) => {
    try {
      // Run git commands
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('Code pushed successfully!');
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program.parse();
