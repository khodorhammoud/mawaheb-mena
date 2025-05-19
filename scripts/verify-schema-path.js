#!/usr/bin/env node

import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../');

// Path to schema file
const schemaPath = path.resolve(projectRoot, 'packages/db/src/schema/schema.ts');

console.log('Checking for schema file at:', schemaPath);

// Check if file exists
if (fs.existsSync(schemaPath)) {
  console.log('✅ Schema file exists at this path');

  // Get file stats
  const stats = fs.statSync(schemaPath);
  console.log('File size:', stats.size, 'bytes');
  console.log('Last modified:', stats.mtime);

  // Read first few lines of the file
  const fileContent = fs.readFileSync(schemaPath, 'utf8');
  const firstLines = fileContent.split('\n').slice(0, 10).join('\n');

  console.log('\nFirst 10 lines of the file:');
  console.log('---------------------------');
  console.log(firstLines);
  console.log('---------------------------');
} else {
  console.error('❌ Schema file does NOT exist at this path');

  // List directory contents to help debug
  console.log('\nContents of packages directory:');
  try {
    const packagesDir = path.resolve(projectRoot, 'packages');
    const contents = fs.readdirSync(packagesDir);
    console.log(contents);

    if (contents.includes('db')) {
      console.log('\nContents of packages/db directory:');
      const dbDir = path.resolve(packagesDir, 'db');
      console.log(fs.readdirSync(dbDir));

      if (fs.existsSync(path.resolve(dbDir, 'src'))) {
        console.log('\nContents of packages/db/src directory:');
        console.log(fs.readdirSync(path.resolve(dbDir, 'src')));
      }
    }
  } catch (error) {
    console.error('Error listing directory contents:', error.message);
  }
}
