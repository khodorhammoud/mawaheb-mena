import { useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import { Badge } from '~/components/ui/badge';
import { JobCategory } from '@mawaheb/db';

export default function JobCategoryComponent() {
  const { jobCategories } = useLoaderData<{ jobCategories: JobCategory[] }>();
  const [selectedCategory, setSelectedCategory] = useState<number>(null);

  const toggleJobCategory = (jobCategoryId: number) => {
    setSelectedCategory(jobCategoryId);
  };

  return (
    <>
      <h3 className="text-lg font-semibold mb-2">Job Category</h3>
      <div className="flex flex-wrap gap-2">
        <input type="hidden" name="jobCategory" value={selectedCategory} />
        {jobCategories.map(jobCategory => (
          <Badge
            key={jobCategory.id}
            onClick={() => toggleJobCategory(jobCategory.id)}
            className={`cursor-pointer px-4 py-2 ${
              selectedCategory == jobCategory.id
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {jobCategory.label}
          </Badge>
        ))}
      </div>
    </>
  );
}
