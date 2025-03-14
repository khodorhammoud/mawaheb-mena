import "@testing-library/jest-dom";
import { afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Create an MSW server instance
const server =
  setupServer();
  // Define your request handlers here
  // Example:
  // http.get('/api/users', () => {
  //   return HttpResponse.json([{ id: 1, name: 'User 1' }]);
  // }),

// Start the MSW server before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close server after all tests
afterAll(() => server.close());

// Global mocks for integration tests can be defined here
// Integration tests will often involve testing API interactions
