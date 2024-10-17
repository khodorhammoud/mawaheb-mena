import { json, LoaderFunctionArgs } from "@remix-run/node";
import ContactUsPage from "./ContactUs";
<<<<<<< HEAD

=======
import { fetchCMSData } from "~/api/fetch-cms-data.server";
import {
  GET_CONTACT_US_FORM_QUERY,
  GET_LOCATION_SECTION_QUERY,
} from "../../../../shared/cms-queries";
import { ContactUsForm, Location } from "../../types/PageContent";

interface LoaderData {
  contactUsFormSection: ContactUsForm[];
  locationSection: Location[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const dataResponse = await fetchCMSData([
    GET_CONTACT_US_FORM_QUERY,
    GET_LOCATION_SECTION_QUERY,
  ]);

  const contactUsFormSection: ContactUsForm[] =
    dataResponse[0]?.data?.contactUsFormSection || [];

  const locationSection: Location[] =
    dataResponse[1]?.data?.locationSection || [];

  // Return the data as JSON
  return json<LoaderData>({
    contactUsFormSection,
    locationSection,
  });
};
>>>>>>> origin/dev
export default function Layout() {
  return (
    <div
      className="container"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <ContactUsPage />
    </div>
  );
}
