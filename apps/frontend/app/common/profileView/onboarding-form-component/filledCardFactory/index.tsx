import { VideoFilledCard } from "./VideoFilledCard";
import { IncrementFilledCard } from "./IncrementFilledCard";
import { RepeatableFilledCard } from "./RepeatableFilledCard";
import { TextFilledCard } from "./TextFilledCard";
import { FilledGeneralizableFormCardProps } from "../types";
import { DefaultFilledCard } from "./DefaultFilledCard";
// ... other filled card imports

export function FilledCardFactory(props: FilledGeneralizableFormCardProps) {
  switch (props.formType) {
    case "video":
      return <VideoFilledCard {...props} />;
    case "increment":
      return <IncrementFilledCard {...props} />;
    case "repeatable":
      return <RepeatableFilledCard {...props} />;
    case "text":
    case "textArea":
      return <TextFilledCard {...props} />;
    // ... other cases
    default:
      return <DefaultFilledCard {...props} />;
  }
}
