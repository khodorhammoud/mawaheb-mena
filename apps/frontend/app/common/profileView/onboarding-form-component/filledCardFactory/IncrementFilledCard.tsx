import { FilledGeneralizableFormCardProps } from "../types";

export function IncrementFilledCard({
  inputValue,
}: FilledGeneralizableFormCardProps) {
  return <div>{inputValue as string}</div>;
}
