import { ReactNode } from 'react';

export interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  className = 'min-w-full divide-y divide-gray-300',
  headerClassName = 'py-3.5 px-3 text-left text-sm font-semibold text-gray-900',
  rowClassName = 'hover:bg-gray-50',
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500 py-4">{emptyMessage}</p>;
  }

  return (
    <div className="mt-2 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className={className}>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index} scope="col" className={headerClassName}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map(item => (
                <tr key={keyExtractor(item)} className={rowClassName}>
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={`whitespace-nowrap py-4 px-3 text-sm ${column.className || 'text-gray-500'}`}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : (item[column.accessor] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
