#!/usr/bin/env node

import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
console.log('Current directory:', currentDir);

console.log('Testing package resolution...');
try {
  execSync('pnpm list @mawaheb/db', {
    cwd: path.resolve(currentDir, '..'),
    stdio: 'inherit',
  });

  console.log('\nTesting path resolution...');
  const dbPackagePath = path.resolve(currentDir, '../packages/db');
  console.log('DB package path:', dbPackagePath);

  console.log('\nListing files in DB package:');
  execSync(`ls -la ${dbPackagePath}/src`, { stdio: 'inherit' });

  console.log('\nScript completed successfully!');
} catch (error) {
  console.error('Error during test:', error);
}
