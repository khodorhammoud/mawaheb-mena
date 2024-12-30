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

export function parseHtmlContent(content: string): {
  isHtml: boolean;
  content: string;
} {
  // Simple regex to detect HTML tags
  const htmlRegex = /<[^>]*>/;
  const isHtml = htmlRegex.test(content);

  if (!isHtml) {
    return { isHtml: false, content };
  }

  // For security, sanitize the HTML
  return { isHtml: true, content: DOMPurify.sanitize(content) };
}
