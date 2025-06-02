import { useState, useEffect } from 'react';

interface ReadMoreProps {
  html: string;
  wordsPerChunk?: number;
  className?: string;
}

export default function ReadMore({ html, wordsPerChunk = 100, className }: ReadMoreProps) {
  const [words, setWords] = useState<string[]>([]);
  const [chunksShown, setChunksShown] = useState(1);

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    setWords(text.split(/\s+/));
    setChunksShown(1); // Reset when html or chunk size changes
  }, [html, wordsPerChunk]);

  if (!words.length) return null;

  const totalChunks = Math.ceil(words.length / wordsPerChunk);
  const shownWords = words.slice(0, chunksShown * wordsPerChunk).join(' ');
  const hasMore = chunksShown < totalChunks;

  return (
    <div className={className}>
      <div>
        {shownWords}
        {hasMore && '...'}
      </div>
      {hasMore && (
        <button
          className="text-primaryColor underline mt-2"
          onClick={() => setChunksShown(s => s + 1)}
        >
          Read more
        </button>
      )}
    </div>
  );
}
