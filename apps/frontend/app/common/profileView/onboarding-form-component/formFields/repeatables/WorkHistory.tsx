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
import AppFormField from "~/common/form-fields";
import RichTextEditor from "~/components/ui/richTextEditor";
import DOMPurify from "dompurify";

interface WorkHistoryComponentProps {
  data: WorkHistoryFormFieldType;
  onTextChange: (data: WorkHistoryFormFieldType) => void;
}

function WorkHistoryComponent({
  data,
  onTextChange,
}: WorkHistoryComponentProps) {
  const getWordCount = (html: string) =>
    DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim().length;

  const handleDescriptionChange = (content: string) => {
    onTextChange({ ...data, jobDescription: content });
  };

  return (
    <div className="p-1">
      {/* Forms */}
      <div className="flex space-x-4 mt-2 mb-6">
        <AppFormField
          type="text"
          id="title[]"
          name="title[]"
          placeholder="Title"
          defaultValue={data.title}
          label="Title"
          className="w-1/2 border-gray-300 rounded-md"
          onChange={(e) => onTextChange({ ...data, title: e.target.value })}
        />
        <AppFormField
          type="text"
          id="company[]"
          name="company[]"
          placeholder="Company"
          defaultValue={data.company}
          label="Company"
          className="w-1/2 border-gray-300 rounded-md"
          onChange={(e) => onTextChange({ ...data, company: e.target.value })}
        />
      </div>

      {/* Checkbox */}
      <div className="flex space-x-4 text-sm items-center ml-2 mb-6">
        <Checkbox
          id="currentlyWorkingThere"
          checked={data.currentlyWorkingThere}
          onCheckedChange={(e: boolean) =>
            onTextChange({ ...data, currentlyWorkingThere: e })
          }
        />
        <label htmlFor="currentlyWorkingThere" className="text-gray-600">
          I currently work here
        </label>
      </div>

      {/* Start Date */}
      <div className="flex space-x-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-1/2 border-gray-300 rounded-md text-left font-normal ${
                !data.startDate ? "text-muted-foreground" : ""
              }`}
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

        {/* End Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-1/2 border-gray-300 rounded-md text-left font-normal ${
                !data.endDate ? "text-muted-foreground" : ""
              }`}
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

      {/* Job Description */}
      <div className="flex flex-col gap-2">
        <RichTextEditor
          value={data.jobDescription}
          onChange={handleDescriptionChange}
          placeholder="Job Description"
          className="border-gray-300 rounded-md resize-none mt-6 mb-1 text-left break-words whitespace-normal overflow-hidden"
          style={{
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        />

        <div className="ml-6 text-xs text-gray-500">
          {getWordCount(data.jobDescription)} / 2000 words
        </div>
      </div>
    </div>
  );
}

export default WorkHistoryComponent;
