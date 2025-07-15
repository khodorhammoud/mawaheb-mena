import React, { Suspense } from 'react';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import '~/styles/wavy/wavy.css';

// Use React.lazy instead of Next.js dynamic
const ReactQuill = React.lazy(() => import('react-quill'));

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  name?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  style = {},
  name,
}) => {
  // DO NOT sanitize or trim here! Quill needs to keep the structure intact.
  const handleChange = (content: string) => {
    onChange(content);
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
