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
