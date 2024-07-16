import qs from "qs";
import { getStrapiURL } from "~/utils/api-helpers";

export async function fetchStrapiData(
	path: string,
	urlParamsObject: Record<string, any> = {},
	jwt?: string | null
) {
	const headers: { [key: string]: string } = {
		"Content-Type": "application/json",
	};

	headers["Authorization"] = `Bearer ${process.env.STRAPI_API_KEY}`;

	const queryString = qs.stringify(urlParamsObject);
	const requestUrl = `${getStrapiURL(`/api${path}`)}${queryString ? `?${queryString}` : ""}`;

	const response = await fetch(requestUrl, { headers: headers });

	if (!response.ok) {
		const errorMessage = await response.text();
		console.error(errorMessage || response.statusText);
		throw new Error(errorMessage || "An error occurred. Please try again.");
	}

	const data = await response.json();
	return data;
}
