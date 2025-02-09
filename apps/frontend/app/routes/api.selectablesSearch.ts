import { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserVerified } from "~/auth/auth.server";

import {
  fetchIndustriesSearch,
  fetchLanguagesSearch,
  fetchSkillsSearch,
} from "~/servers/general.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserVerified(request);
  const url = new URL(request.url);
  const dataType = url.searchParams.get("dataType");
  const searchTerm = url.searchParams.get("searchTerm") || "";

  if (dataType === "skill") {
    const skills = await fetchSkillsSearch(searchTerm);
    return Response.json({ items: skills });
  }
  if (dataType === "language") {
    const languages = await fetchLanguagesSearch(searchTerm);
    return Response.json({ items: languages });
  }

  if (dataType === "industry") {
    const industries = await fetchIndustriesSearch(searchTerm);
    return Response.json({ items: industries });
  }

  return Response.json({ error: "Invalid data type" }, { status: 400 });
}
