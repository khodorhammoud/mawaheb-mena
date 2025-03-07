import { format } from "date-fns";

export function formatTimeAgo(createdAt: string | Date): string {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `Posted ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInHours < 24) {
    return `Posted ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInDays <= 7) {
    return `Posted ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  } else {
    return `Posted on ${format(createdDate, "yyyy-MM-dd")}`;
  }
}
