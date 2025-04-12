import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { TimePicker } from '~/components/ui/time-picker';
import type { TimesheetEntry, EntryPopup } from '@mawaheb/db';

interface TimeEntryDialogProps {
  popup: EntryPopup;
  formData: TimesheetEntry;
  setFormData: (data: TimesheetEntry) => void;
  onSave: (formData: TimesheetEntry) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function TimeEntryDialog({
  popup,
  formData,
  setFormData,
  onSave,
  onDelete,
  onClose,
}: TimeEntryDialogProps) {
  return (
    <Dialog open={popup.isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white" aria-describedby="time-entry-dialog">
        <DialogHeader>
          <DialogTitle>{popup.isEdit ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <label htmlFor="startTime" className="block">
            <span className="text-gray-700">Start Time:</span>
            <TimePicker
              date={new Date(Number(formData.startTime))}
              timeFields="hm"
              setDate={date =>
                setFormData({
                  ...formData,
                  startTime: date.getTime() || new Date().getTime(),
                })
              }
            />
          </label>
          <label htmlFor="endTime" className="block">
            <span className="text-gray-700">End Time:</span>
            <TimePicker
              date={new Date(Number(formData.endTime))}
              timeFields="hm"
              setDate={date =>
                setFormData({
                  ...formData,
                  endTime: date.getTime() || new Date().getTime(),
                })
              }
            />
          </label>
          <label htmlFor="description" className="block">
            <span className="text-gray-700">Description:</span>
            <input
              type="text"
              value={formData.description}
              onChange={e =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              /* value={description}
              onChange={(e) => setDescription(e.target.value)} */
              className="block w-full border border-gray-300 p-2 rounded-md mt-1"
            />
          </label>
        </div>
        <DialogFooter className="mt-4">
          {popup.isEdit && (
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
