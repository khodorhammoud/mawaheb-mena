import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseHTTP(link: string) {
  if (!link.startsWith("http")) {
    return `http://${link}`;
  }
}

export function parseDate(date: string | Date) {
  return typeof date === "string" ? new Date(date) : date;
}
