import React, { useState, useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// This is a mock UserProfile component - replace with your actual component
const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div data-testid="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

// Setup MSW server for this test file
const server = setupServer(
  http.get("/api/user", () => {
    return HttpResponse.json({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });
  })
);

beforeEach(() => server.resetHandlers());

describe("UserProfile Integration", () => {
  // Start server before all tests
  beforeAll(() => server.listen());

  // Close server after all tests
  afterAll(() => server.close());

  it("should load and display user data", async () => {
    render(<UserProfile />);

    // Initial loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for API call to resolve
    await waitFor(() => {
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    // Check that user data is displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should handle API errors", async () => {
    // Override the handler just for this test
    server.use(
      http.get("/api/user", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    // Test component with error handling
    // This would depend on how your actual component handles errors
  });
});
