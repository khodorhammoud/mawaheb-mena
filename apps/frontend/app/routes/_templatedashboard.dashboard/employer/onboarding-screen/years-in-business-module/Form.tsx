import { useEffect, useState } from "react";

import { BsCurrencyDollar } from "react-icons/bs";
import { Button } from "~/components/ui/button";

import {
  Card,
  CardContent,
  // CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Dialog,
  DialogTrigger,
} from "~/components/ui/dialog";
import { SlBadge } from "react-icons/sl";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Form, useLoaderData } from "@remix-run/react";
import { Employer } from "~/types/User";

export default function BudgetModuleForm() {
  const [yearsInBusiness, setYearsInBusiness] = useState(0);
  const [open, setOpen] = useState(false); // Set true to show the dialog by default

  const { currentUser } = useLoaderData<{ currentUser: Employer }>();
  const increaseYears = () => {
    setYearsInBusiness(yearsInBusiness < 30 ? yearsInBusiness + 1 : 30);
  };
  // set years in business from current user
  useEffect(() => {
    setYearsInBusiness(currentUser?.yearsInBusiness || 0);
  }, []);

  const decreaseYears = () =>
    setYearsInBusiness(yearsInBusiness > 0 ? yearsInBusiness - 1 : 0);

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 0;
    // if (value < 1) value = 1;
    if (value > 30) value = 30;
    setYearsInBusiness(value);
  };

  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Years in Business</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="link">
                <SlBadge className="text-lg mr-2" /> add years in business
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white p-6">
              <DialogHeader>
                <DialogTitle>Years in business</DialogTitle>
              </DialogHeader>

              <div className="flex items-center justify-center space-x-4 my-4">
                {/* Decrease Button */}
                <Button
                  variant="outline"
                  className="w-10 h-10"
                  onClick={decreaseYears}
                >
                  -
                </Button>
                <Form method="post" id="experience-form">
                  <input
                    type="hidden"
                    name="target-updated"
                    value="employer-years-in-business"
                  />
                  {/* Display Current Years */}
                  <Input
                    value={yearsInBusiness}
                    className="text-center w-16 h-10"
                    name="years-in-business"
                    min={1}
                    max={30}
                    onChange={handleYearsChange}
                  />
                </Form>
                {/* Increase Button */}
                <Button
                  variant="outline"
                  className="w-10 h-10"
                  onClick={increaseYears}
                >
                  +
                </Button>
              </div>

              <DialogFooter className="mt-4">
                <Button className="px-6" type="submit" form="experience-form">
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
