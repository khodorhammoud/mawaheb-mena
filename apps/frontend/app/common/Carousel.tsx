import { useState } from 'react';

interface CarouselProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Carousel({ currentPage, totalPages, onPageChange }: CarouselProps) {
  const [activePage, setActivePage] = useState(currentPage);

  const handlePageChange = (page: number) => {
    setActivePage(page);
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 rounded-full flex items-center justify-center mx-1
            ${
              activePage === i
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 my-4">
      <button
        onClick={() => handlePageChange(Math.max(1, activePage - 1))}
        disabled={activePage === 1}
        className={`w-8 h-8 rounded-full flex items-center justify-center
          ${
            activePage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
      >
        {'<'}
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
        disabled={activePage === totalPages}
        className={`w-8 h-8 rounded-full flex items-center justify-center
          ${
            activePage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
      >
        {'>'}
      </button>
    </div>
  );
}
