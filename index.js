#!/usr/bin/env node
const { execSync } = require('child_process');
const { program } = require('commander');

// Define a command that takes a 'message' as input
program
  .argument('<message>', 'Commit message')
  .action((message) => {
    try {
      // Add all changes
      execSync('git add .', { stdio: 'inherit' });
      // Commit with the provided message
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      // Push to the main branch
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('Code pushed successfully!');
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

// Parse command-line arguments
program.parse();
