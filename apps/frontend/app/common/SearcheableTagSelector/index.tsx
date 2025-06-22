// this is the search for the languages and industries, with their badges ❤️

import { useState, useRef, useEffect, SetStateAction, Dispatch } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Badge } from '~/components/ui/badge';
import { useFetcher } from '@remix-run/react';
import AppFormField from '../form-fields';
interface SearcheableTagSelectorProps<T> {
  dataType: 'skill' | 'language' | 'industry';
  selectedItems: T[];
  setSelectedItems: Dispatch<SetStateAction<T[]>>;
  itemLabel: (item: T) => string;
  itemKey: (item: T) => number;
  formName: string;
  fieldName: string;
  searchPlaceholder?: string;
  autoSubmit?: boolean;
  onSubmit?: () => void;
}

export default function SearcheableTagSelector<T>({
  dataType,
  selectedItems,
  setSelectedItems,
  itemLabel,
  itemKey,
  searchPlaceholder = 'Search or type...',
}: SearcheableTagSelectorProps<T>) {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
    items?: T[];
  }>();

  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  function search() {
    const params = new URLSearchParams({
      dataType: dataType,
      searchTerm: searchTerm,
    });

    searchFetcher.load(`/api/selectablesSearch?${params.toString()}`);
    // log the results
  }

  useEffect(() => {
    // set a timeout to search after 500ms
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      search();
    }, 500);
  }, [searchTerm]);

  // search for all items once the component loads
  useEffect(() => {
    search();
  }, []);

  const isItemSelected = (item: T) => {
    return selectedItems?.some(selectedItem => itemKey(selectedItem) === itemKey(item));
  };

  const toggleItem = (item: T) => {
    // add/remove the newly selected/deselected item to the previous selected items
    setSelectedItems((prevSelectedItems: T[]) => {
      const isSelected = isItemSelected(item);

      if (isSelected) {
        return prevSelectedItems.filter(i => itemKey(i) !== itemKey(item));
      } else {
        return [...prevSelectedItems, item];
      }
    });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <AppFormField
            id={searchTerm}
            name={searchTerm}
            label={searchPlaceholder}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute top-1/2 right-2 transform -translate-y-1/2 h-8 w-8 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
        </div>

        <div className="flex flex-wrap gap-2">
          {searchFetcher.data?.items?.length > 0 ? (
            searchFetcher.data?.items?.map(item => (
              <Badge
                key={itemKey(item)}
                onClick={() => toggleItem(item)}
                className={`cursor-pointer rounded-2xl px-4 py-2 hover:shadow-sm ${
                  isItemSelected(item)
                    ? 'bg-blue-100 text-gray-900 hover:bg-blue-100'
                    : 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {itemLabel(item) || '🛑 Empty label'}
              </Badge>
            ))
          ) : (
            <p className="text-gray-500 mb-3">No items found</p>
          )}
        </div>
      </div>
    </>
  );
}
