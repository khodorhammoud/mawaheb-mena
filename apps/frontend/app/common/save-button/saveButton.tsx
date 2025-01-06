import { useState } from "react";

export default function SubmitButton({
  children,
  name,
  value,
  className = "",
  ...props
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <button
      {...props}
      name={name}
      value={value}
      // i disabled the button during form submission 👍
      disabled={isSubmitting}
      className={`rounded-xl ${className} ${
        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isSubmitting ? "Submitting..." : children}
    </button>
  );
}
