import DOMPurify from "isomorphic-dompurify";

interface Headers {
  [key: string]: string;
}

export function getStrapiURL(path = "") {
  // get environment variables
  return process.env.STRAPI_API + path;
}

export function createHeaders(jwt: string | null): Headers {
  const headers: Headers = { "Content-Type": "application/json" };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  return headers;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) {
    return null;
  }

  // Return the full URL if the media is hosted on an external provider
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }

  // Otherwise prepend the URL path with the Strapi URL
  return `${getStrapiURL()}${url}`;
}

// parsing HTML elements ( <p> hi </p> -> hi ❤️)
export function parseHtmlContent(content: string): {
  isHtml: boolean;
  content: string;
} {
  // Trim whitespace for better detection
  const trimmedContent = content.trim();

  // Enhanced regex for detecting HTML tags
  const htmlRegex = /<([a-z]+[1-6]?)([^>]*?)>/i;

  // Check if the trimmed content contains HTML tags
  const isHtml = htmlRegex.test(trimmedContent);

  if (!isHtml) {
    // Return plain text if no HTML tags are detected
    return { isHtml: false, content: trimmedContent };
  }

  // Sanitize the content
  const sanitizedContent = DOMPurify.sanitize(trimmedContent);

  // If sanitized content is empty, treat it as plain text
  if (!sanitizedContent.trim()) {
    return { isHtml: false, content: "" };
  }

  // Return sanitized HTML if valid
  return { isHtml: true, content: sanitizedContent };
}

// this is a backend used function, used for submitting forms, to not have duplicate sybmission of the same thing at the same time ❤️
// -----  ensure that your system does not do the same form submission twice  ----- //
const processedTimestamps = new Set<string>();

/**
 * Function to prevent duplicate form submissions
 * @param timestamp
 * @throws error if timestamp is missing or duplicated
 */
export function preventDuplicateSubmission(timestamp: string | null) {
  if (!timestamp) {
    throw new Error("Timestamp is missing");
  }

  if (processedTimestamps.has(timestamp)) {
    throw new Error("Duplicate submission detected.");
  }

  //  Add the new timestamp to the set up 👆
  processedTimestamps.add(timestamp);
}
