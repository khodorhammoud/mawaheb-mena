import { FilledGeneralizableFormCardProps } from "../types";

export function DefaultFilledCard({
  inputValue,
}: FilledGeneralizableFormCardProps) {
  return <div>{inputValue as string}</div>;
}
