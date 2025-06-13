import { useState, useEffect } from 'react';

interface ReadMoreProps {
  html: string;
  wordsPerChunk?: number;
  className?: string;
}

export default function ReadMore({ html, wordsPerChunk = 100, className }: ReadMoreProps) {
  const [words, setWords] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    setWords(text.split(/\s+/));
    setShowAll(false); // Reset when html or chunk size changes
  }, [html, wordsPerChunk]);

  if (!words.length) return null;

  const hasMore = words.length > wordsPerChunk;
  const displayText = showAll ? words.join(' ') : words.slice(0, wordsPerChunk).join(' ');

  return (
    <div className={className}>
      <div>
        {displayText}
        {!showAll && hasMore && '...'}
      </div>
      {!showAll && hasMore && (
        <button className="text-primaryColor underline mt-2" onClick={() => setShowAll(true)}>
          Read more
        </button>
      )}
    </div>
  );
}
