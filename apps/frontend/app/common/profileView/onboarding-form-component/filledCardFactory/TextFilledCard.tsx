import { FilledGeneralizableFormCardProps } from "../types";

export function TextFilledCard({
  inputValue,
}: FilledGeneralizableFormCardProps) {
  return <div>{inputValue as string}</div>;
}
