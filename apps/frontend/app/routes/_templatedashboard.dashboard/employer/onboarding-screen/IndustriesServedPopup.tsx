import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { FaSearch } from "react-icons/fa";

export default function IndustriesForm() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const industries = [
    "Education",
    "Communication",
    "Agriculture",
    "Production",
    "Manufacturing",
    "Technology",
    "Construction",
    "Other",
  ];

  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Industries</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Input placeholder="Search or type industry" />
          <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Industry Options */}
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => (
            <Badge
              key={industry}
              onClick={() => toggleIndustry(industry)}
              className={`cursor-pointer px-4 py-2 ${
                selectedIndustries.includes(industry)
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {industry}
            </Badge>
          ))}
        </div>

        <DialogFooter className="mt-6">
          <Button className="px-6" type="submit">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
