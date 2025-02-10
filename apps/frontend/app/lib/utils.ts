import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// import DOMPurify from "dompurify";
import DOMPurify from "isomorphic-dompurify";

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

export function getWordCount(html: string) {
  // check if html trimmed is empty
  if (html.trim() === "") {
    return 0;
  }
  console.log(
    "length",
    DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim().length
  );
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim().length || 0;
}
