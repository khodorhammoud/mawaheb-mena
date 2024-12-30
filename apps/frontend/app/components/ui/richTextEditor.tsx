import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import "~/styles/wavy/wavy.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties; // Added `style` prop
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
  style = {}, // Default style object
}) => {
  const handleChange = (content: string) => {
    // Sanitize content for safe usage
    const plainText = DOMPurify.sanitize(content).trim();

    onChange(plainText);
  };

  return (
    <div className={`custom-quill ${className}`} style={style}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className=""
      />
    </div>
  );
};

export default RichTextEditor;
