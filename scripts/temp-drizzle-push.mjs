
      import { drizzle } from 'drizzle-orm/postgres-js';
      import postgres from 'postgres';
      import * as path from 'path';
      import { fileURLToPath } from 'url';
      
      // Import the config
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const projectRoot = path.resolve(currentDir, '../');
      const frontendDir = path.resolve(projectRoot, 'apps/frontend');
      
      async function main() {
        try {
          // Dynamically import the drizzle-kit CLI push
          const { default: push } = await import('drizzle-kit/push');
          
          // Run the push command with test config
          await push({
            driver: 'pg',
            dbCredentials: {
              connectionString: 'postgres://testuser:testpassword@localhost:5433/mawaheb_test_db'
            },
            schema: path.resolve(projectRoot, 'packages/db/src/schema/schema.ts')
          });
          
          console.log('Schema pushed successfully!');
        } catch (error) {
          console.error('Error:', error);
          process.exit(1);
        }
      }
      
      main();
    