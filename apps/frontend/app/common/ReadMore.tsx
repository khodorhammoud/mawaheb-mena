import { useState, useEffect } from 'react';

interface ReadMoreProps {
  html: string;
  wordsPerChunk?: number;
  className?: string;
}

export default function ReadMore({ html, wordsPerChunk = 100, className }: ReadMoreProps) {
  const [previewText, setPreviewText] = useState('');
  const [fullText, setFullText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.split(/\s+/);

    setFullText(text);
    setPreviewText(words.slice(0, wordsPerChunk).join(' '));
  }, [html, wordsPerChunk]);

  if (!fullText) {
    return null;
  }

  const shouldShowReadMore = fullText.split(/\s+/).length > wordsPerChunk;

  return (
    <div className={className}>
      <div>
        {isExpanded ? fullText : previewText}
        {!isExpanded && shouldShowReadMore && '...'}
      </div>
      {shouldShowReadMore && !isExpanded && (
        <button className="text-primaryColor underline mt-2" onClick={() => setIsExpanded(true)}>
          Read more
        </button>
      )}
    </div>
  );
}
