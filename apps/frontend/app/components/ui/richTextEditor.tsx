import React, { Suspense } from "react";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import "~/styles/wavy/wavy.css";

// Use React.lazy instead of Next.js dynamic
const ReactQuill = React.lazy(() => import("react-quill"));

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties; // Added `style` prop
  name?: string; // Add the `name` prop
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
  style = {}, // Default style object
  name, // Accept the `name` prop
}) => {
  const handleChange = (content: string) => {
    // Sanitize content for safe usage
    const plainText = DOMPurify.sanitize(content).trim();

    onChange(plainText);
  };

  return (
    <div className={`custom-quill ${className}`} style={style}>
      <Suspense fallback={<div>Loading editor...</div>}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className=""
        />
      </Suspense>
      {/* Optional hidden input for form compatibility */}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
};

export default RichTextEditor;
