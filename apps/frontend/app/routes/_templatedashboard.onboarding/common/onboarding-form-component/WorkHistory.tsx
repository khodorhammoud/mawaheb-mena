import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { WorkHistoryFormFieldType } from "~/types/User";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface WorkHistoryComponentProps {
  data: WorkHistoryFormFieldType;
  onTextChange: (data: WorkHistoryFormFieldType) => void;
}

function WorkHistoryComponent({
  data,
  onTextChange,
}: WorkHistoryComponentProps) {
  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Input
          type="text"
          placeholder="Title"
          className="w-1/2 border-gray-300 rounded-md"
          value={data.title}
          onChange={(e) => onTextChange({ ...data, title: e.target.value })}
          name="title[]"
        />
        <Input
          type="text"
          placeholder="Company"
          className="w-1/2 border-gray-300 rounded-md"
          value={data.company}
          onChange={(e) => onTextChange({ ...data, company: e.target.value })}
          name="company[]"
        />
      </div>
      <div className="flex space-x-4">
        <Checkbox
          id="currentlyWorkingThere"
          checked={data.currentlyWorkingThere}
          onCheckedChange={(e: boolean) =>
            onTextChange({ ...data, currentlyWorkingThere: e })
          }
        />
        <label htmlFor="currentlyWorkingThere">I currently work here</label>
      </div>
      <div className="flex space-x-4">
        {/* start date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-1/2 border-gray-300 rounded-md text-left font-normal
            ${!data.startDate ? "text-muted-foreground" : ""}
          `}
            >
              {data.startDate ? (
                format(data.startDate, "PPP")
              ) : (
                <span>Start Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data.startDate}
              onSelect={(e) => onTextChange({ ...data, startDate: e })}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* end date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-1/2 border-gray-300 rounded-md text-left font-normal
            ${!data.endDate ? "text-muted-foreground" : ""}
          `}
            >
              {data.endDate ? (
                format(data.endDate, "PPP")
              ) : (
                <span>End Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data.endDate}
              onSelect={(e) => onTextChange({ ...data, endDate: e })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex space-x-4">
        <textarea
          placeholder="Job Description"
          className="w-full border-gray-300 rounded-md p-3 resize-none"
          rows={4}
          maxLength={2000}
          name="jobDescription[]"
          value={data.jobDescription}
          onChange={(e) =>
            onTextChange({ ...data, jobDescription: e.target.value })
          }
        />
        <div className="text-right text-sm text-gray-500">
          {data.jobDescription.length}/2000 words
        </div>
      </div>
    </div>
  );
}

export default WorkHistoryComponent;
