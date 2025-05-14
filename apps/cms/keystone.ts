import { config } from '@keystone-6/core';
import { lists } from './schema';
import { withAuth, session } from './auth';

// load env variables
require('dotenv').config();

console.log(process.env.POSTGRESQL_CONNECTION_STRING);

export default withAuth(
  config({
    db: {
      provider: 'postgresql',
      url: process.env.POSTGRESQL_CONNECTION_STRING as string,
      //  || 'postgresql://postgres:pass@localhost:5432/mawaheb-cms?schema=public',
      enableLogging: true,
      idField: { kind: 'uuid' },
    },
    lists,
    session,
    server: {
      // Adding CORS configuration
      cors: {
        origin: [process.env.FRONTEND_URL as string], // Replace with your frontend URL or add multiple origins if needed
        credentials: true, // Allow cookies and other credentials to be sent
      },
    },
  })
);

// postgresql://mawaheb_owner:cltE5b0qUgdv@ep-still-wind-a236960h.eu-central-1.aws.neon.tech/mawaheb-cms?sslmode=require
