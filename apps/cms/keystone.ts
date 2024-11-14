import { config } from "@keystone-6/core";
import { lists } from "./schema";
import { withAuth, session } from "./auth";

export default withAuth(
  config({
    db: {
      provider: "postgresql",
      url: "postgresql://mawaheb_owner:cltE5b0qUgdv@ep-still-wind-a236960h.eu-central-1.aws.neon.tech/mawaheb-cms?sslmode=require", //process.env.POSTGRESQL_CONNECTION_STRING!,
      enableLogging: true,
      idField: { kind: "uuid" },
    },
    lists,
    session,
    server: {
      // Adding CORS configuration
      cors: {
        origin: ["http://localhost:5173"], // Replace with your frontend URL or add multiple origins if needed
        credentials: true, // Allow cookies and other credentials to be sent
      },
    },
  })
);

// postgresql://mawaheb_owner:cltE5b0qUgdv@ep-still-wind-a236960h.eu-central-1.aws.neon.tech/mawaheb-cms?sslmode=require
