import { Card, CardHeader, CardTitle } from "~/common/header/card";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { FilledGeneralizableFormCardProps } from "../types";
import { Badge } from "~/components/ui/badge";

export function RepeatableFilledCard({
  cardTitle,
  repeatableInputValues,
}: FilledGeneralizableFormCardProps) {
  return (
    <Card className="bg-blue-50 border-2 rounded-xl border-primaryColor pl-8 pb-5 pt-5">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold text-primaryColor mb-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primaryColor" />
          {cardTitle}
        </CardTitle>
      </CardHeader>

      <div className="mt-4 flex flex-wrap gap-2">
        {repeatableInputValues.map((value, index) => (
          <Badge key={index} variant="secondary">
            {JSON.stringify(value)}
          </Badge>
        ))}
      </div>

      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="mt-4 bg-primaryColor text-white hover:bg-primaryColor/90"
          >
            Edit Items
          </Button>
        </DialogTrigger>
        {/* ... Dialog content ... */}
      </Dialog>
    </Card>
  );
}
