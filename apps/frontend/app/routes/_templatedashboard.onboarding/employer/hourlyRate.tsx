import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { FaDollarSign } from "react-icons/fa";

function HourlyRateCard() {
  const [hourlyRate, setHourlyRate] = useState<string>("");

  return (
    <Card
      className="w-full p-6 bg-gray-100 border border-gray-400 border-dashed rounded-2xl"
      style={{
        borderWidth: "2px",
        borderStyle: "dashed",
        borderColor: "#cbd5e1",
        borderSpacing: "10px",
      }}
    >
      <p className="font-bold mb-4 text-gray-700">Hourly Rate</p>
      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="trigger flex items-center space-x-2 border border-gray-400"
            style={{ borderWidth: "2px", borderColor: "#cbd5e1" }}
          >
            <FaDollarSign />
            <span>Add Hourly Rate</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="space-y-4">
          <DialogTitle>Add Hourly Rate</DialogTitle>
          <Input
            type="number"
            placeholder="Enter your hourly rate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <DialogFooter>
            <Button
              onClick={() => {
                // Handle saving hourly rate logic here
                console.log("Hourly Rate:", hourlyRate);
              }}
              className="action bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default HourlyRateCard;
