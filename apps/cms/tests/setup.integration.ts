import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import supertest from "supertest";
import { createSystem } from "@keystone-6/core/system";
import keystoneConfig from "../keystone";

// This is a simplified example - you'll need to adapt this to your actual Keystone config
let app: any;
let server: any;

// Create an MSW server to mock external API calls if needed
const mswServer = setupServer();

// Start MSW server for mocking external APIs
beforeAll(async () => {
  // Start the MSW server
  mswServer.listen();

  // Set up a test Keystone instance
  // This is a simplified example - actual implementation will depend on your Keystone config
  try {
    // Create a test system with an in-memory SQLite database or mock database
    // const testConfig = { ...keystoneConfig, db: { provider: 'sqlite', url: ':memory:' } };
    // const { keystone, expressApp } = createSystem(testConfig);
    // app = expressApp;
    // Start Keystone server
    // server = app.listen(3001);
    // Initialize database or load fixtures if needed
  } catch (error) {
    console.error("Error setting up test environment:", error);
  }
});

// Reset handlers and database state after each test
afterEach(async () => {
  mswServer.resetHandlers();
  // Reset database state if needed
});

// Close servers after all tests
afterAll(async () => {
  mswServer.close();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  // Cleanup any other resources
});

// Export helper to create requests to the Keystone API
export const createTestClient = () => {
  if (!app) throw new Error("Test client not initialized");
  return supertest(app);
};
