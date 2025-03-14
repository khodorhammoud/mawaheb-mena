import { afterEach, vi } from "vitest";

// Mock Keystone's context and database connection
vi.mock("@keystone-6/core/context", () => ({
  getContext: vi.fn(() => ({
    db: {
      // Mock database methods as needed
      User: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      // Add other collections as needed
    },
    query: {
      User: {
        findMany: vi.fn(),
        findOne: vi.fn(),
        count: vi.fn(),
        createOne: vi.fn(),
        updateOne: vi.fn(),
        deleteOne: vi.fn(),
      },
      // Add other collections as needed
    },
    // Add other context properties as needed
  })),
}));

// Reset mocks after each test
afterEach(() => {
  vi.resetAllMocks();
});
