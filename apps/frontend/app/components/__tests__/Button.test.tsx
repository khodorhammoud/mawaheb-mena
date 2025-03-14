import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Assuming there is a Button component in the components directory
// If not, this is just a template example
const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button onClick={onClick} data-testid="test-button">
      {children}
    </button>
  );
};

describe("Button Component", () => {
  it("should render correctly", () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByTestId("test-button")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByTestId("test-button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
