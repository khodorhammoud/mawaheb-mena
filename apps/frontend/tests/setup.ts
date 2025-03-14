import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Global mocks can be defined here
// For example:
// vi.mock('~/services/api', () => ({
//   fetchData: vi.fn(),
// }));

// Mock window.fetch and other browser APIs if needed
// Global setup can be defined here
