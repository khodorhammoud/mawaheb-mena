import { useState, useRef, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { Badge } from "~/components/ui/badge";
import { useFetcher } from "@remix-run/react";

interface SearcheableTagSelectorProps<T> {
  data: T[];
  selectedKeys: number[] | string[];
  itemLabel: (item: T) => string;
  itemKey: (item: T) => number | string;
  formName: string;
  fieldName: string;
  searchPlaceholder?: string;
}

export default function SearcheableTagSelector<T>({
  data,
  selectedKeys,
  itemLabel,
  itemKey,
  formName,
  fieldName,
  searchPlaceholder = "Search or type...",
}: SearcheableTagSelectorProps<T>) {
  const [selectedItems, setSelectedItems] =
    useState<(typeof selectedKeys)[0][]>(selectedKeys);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const formFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSelectedItems(selectedKeys);
  }, [selectedKeys]);

  const filteredItems = data.filter((item) =>
    itemLabel(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (key: (typeof selectedItems)[0]) => {
    const newSelectedItems = selectedItems.includes(key)
      ? selectedItems.filter((i) => i !== key)
      : [...selectedItems, key];

    setSelectedItems(newSelectedItems);

    setTimeout(() => {
      if (formRef.current) {
        formFetcher.submit(formRef.current);
      }
    }, 100);
  };

  /* const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      setSearchTerm(""); // Reset search term when dialog is closed
    }
  }; */

  return (
    <>
      <formFetcher.Form ref={formRef} method="post">
        <input type="hidden" name="target-updated" value={formName} />
        <input type="hidden" name={fieldName} value={selectedItems.join(",")} />
      </formFetcher.Form>
      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          className="pl-10"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Badge
              key={itemKey(item)}
              onClick={() => toggleItem(itemKey(item))}
              className={`cursor-pointer px-4 py-2 ${
                selectedItems.includes(itemKey(item))
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {itemLabel(item)}
            </Badge>
          ))
        ) : (
          <p className="text-gray-500">No items found</p>
        )}
      </div>
    </>
  );
}
