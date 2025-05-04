// Custom server wrapper for the Remix application
// This adds better error handling and logging to prevent silent exits

import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Log important environment variables for debugging
console.log('=======================================');
console.log('Starting custom server wrapper');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(
  `DATABASE_URL: ${process.env.DATABASE_URL ? 'Set (not showing for security)' : 'Not set'}`
);
console.log(`NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);

// Test the database connection early
async function testDatabaseConnection() {
  try {
    console.log('Attempting to connect to database...');
    const { db } = await import('@mawaheb/db/server');

    console.log('Database module imported successfully, testing connection...');
    const result = await db.execute('SELECT 1 AS test');
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

// Start the server
async function startServer() {
  // Test database connection but continue even if it fails
  await testDatabaseConnection().catch(error => {
    console.error('Database test failed but continuing server startup:', error);
  });

  const app = express();

  // Add health check endpoint that doesn't depend on Remix
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'Custom Express wrapper',
    });
  });

  // Properly map the /assets path - critical for Remix to find its assets
  app.use(
    '/assets',
    express.static(path.join(__dirname, 'build/client/assets'), {
      immutable: true,
      maxAge: '1y',
    })
  );

  // Serve other static assets from the build directory
  app.use(express.static(path.join(__dirname, 'build/client'), { maxAge: '1h' }));

  // Also serve files from public directory for backward compatibility
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

  // Use dynamic import for build output
  const build = await import('./build/server/index.js');

  // Create request handler with error handling
  const getRequestHandler = () => {
    return createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    });
  };

  app.all('*', (req, res, next) => {
    try {
      return getRequestHandler()(req, res, next);
    } catch (error) {
      console.error('Error in request handler:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // Handle unhandled promise rejections to prevent crashes
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Keep the server running despite the error
  });

  // Handle uncaught exceptions to prevent crashes
  process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    // Keep the server running despite the error
  });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
});
