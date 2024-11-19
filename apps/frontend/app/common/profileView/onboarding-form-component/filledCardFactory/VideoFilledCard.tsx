import { Card, CardHeader, CardTitle } from "~/common/header/card";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { FilledGeneralizableFormCardProps } from "../types";

export function VideoFilledCard({
  cardTitle,
  inputValue,
}: FilledGeneralizableFormCardProps) {
  const getYouTubeId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("v");
  };

  return (
    <Card className="bg-blue-50 border-2 rounded-xl border-primaryColor pl-8 pb-5 pt-5">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold text-primaryColor mb-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primaryColor" />
          {cardTitle}
        </CardTitle>
      </CardHeader>

      <div className="mt-4">
        <div className="aspect-video w-[200px] rounded-lg overflow-hidden">
          {/* Video thumbnail or preview */}
          <img
            src={`https://img.youtube.com/vi/${getYouTubeId(inputValue as string)}/0.jpg`}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="mt-4 bg-primaryColor text-white hover:bg-primaryColor/90"
          >
            Edit Video
          </Button>
        </DialogTrigger>
        {/* ... Dialog content ... */}
      </Dialog>
    </Card>
  );
}
