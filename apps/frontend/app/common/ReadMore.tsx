import { useState, useEffect } from 'react';

interface ReadMoreProps {
  html: string;
  wordsPerChunk?: number;
  className?: string; // 👈 Add this line
}

export default function ReadMore({ html, wordsPerChunk = 100, className }: ReadMoreProps) {
  const [chunks, setChunks] = useState<string[]>([]);
  const [visibleChunks, setVisibleChunks] = useState(1);

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.split(/\s+/);
    const chunkArr = [];
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunkArr.push(words.slice(i, i + wordsPerChunk).join(' '));
    }
    setChunks(chunkArr);
  }, [html, wordsPerChunk]);

  if (chunks.length === 0) {
    return null;
  }

  const canReadMore = visibleChunks < chunks.length;

  return (
    <div className={className}>
      <div>{chunks.slice(0, visibleChunks).join(' ')}</div>
      {canReadMore && (
        <button
          className="text-primaryColor underline mt-2"
          onClick={() => setVisibleChunks(v => v + 1)}
        >
          Read more
        </button>
      )}
    </div>
  );
}
