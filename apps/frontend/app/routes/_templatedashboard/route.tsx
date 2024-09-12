import Header from "./header";
import { Outlet } from "@remix-run/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}
export default function Layout() {
  return (
    <div>
      {/* <p>yahh</p> */}
      {/* the above comment was for testing which route is gonna appear 👍 */}
      <Header />
      <div className="mt-[100px]">
        <Outlet />
      </div>
      {/* outlet is the content of the page */}
    </div>
  );
}
