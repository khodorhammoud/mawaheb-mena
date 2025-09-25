import { useState, useMemo } from 'react';
import '../styles/globals.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Helper to get HTML up to N visible characters
function getHtmlSliceByVisibleChars(html, visibleChars) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  if (visibleChars >= text.length) {
    return html; // Show all
  }
  // Find where in HTML the cutoff is
  let count = 0,
    i = 0;
  while (i < html.length && count < visibleChars) {
    if (html[i] === '<') {
      while (i < html.length && html[i] !== '>') i++;
      i++;
    } else {
      count++;
      i++;
    }
  }
  return html.slice(0, i);
}

interface ReadMoreProps {
  html: string;
  charPerChunk?: number;
  className?: string;
}

export default function ReadMore({ html, charPerChunk = 100, className = '' }: ReadMoreProps) {
  const [chunks, setChunks] = useState(1);

  // Compute total visible chars
  const totalVisibleChars = useMemo(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || '').length;
  }, [html]);

  const visibleChars = charPerChunk * chunks;
  const displayHtml = getHtmlSliceByVisibleChars(html, visibleChars);
  const isAllVisible = visibleChars >= totalVisibleChars;

  // ** Show button only if charPerChunk is set and content is longer than charPerChunk **
  const shouldShowButton = !!charPerChunk && totalVisibleChars > charPerChunk;

  const handleReadMore = () => setChunks(c => c + 1);
  const handleHide = () => setChunks(1);

  return (
    <div className={`prose prose-sm ${className}`}>
      <div
        dangerouslySetInnerHTML={{
          __html: displayHtml + (!isAllVisible && shouldShowButton ? '...' : ''),
        }}
      />
      {shouldShowButton && (
        <button
          className={`mt-3 px-2 py-1 text-sm font-semibold hover:bg-primaryColor/10 transition border rounded-xl flex gap-1 ${
            isAllVisible ? 'text-red-600' : 'text-primaryColor'
          }`}
          onClick={isAllVisible ? handleHide : handleReadMore}
          data-testid="read-more-button"
        >
          {isAllVisible ? (
            <div className="flex items-center justify-center gap-1">
              <ChevronUp className="w-3 h-3 text-red-600" />
              <p>Hide description</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <ChevronDown className="w-3 h-3" />
              <p>Read more</p>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
