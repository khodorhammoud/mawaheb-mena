import { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "../../auth/auth.server";
import { createUserSession } from "../../auth/session.server";
import { AuthorizationError } from "remix-auth";
import AdminLoginPage from "./Login";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const userId = await authenticator.authenticate("login", request, {
      throwOnError: true,
    });
    return await createUserSession(
      request,
      userId,
      "/admin-dashboard/accounts"
    );
  } catch (error) {
    console.log(error);
    if (error instanceof AuthorizationError) {
      return Response.json({
        success: false,
        error: {
          code: error.cause,
          message: error.message,
        },
      });
    }
    return Response.json({
      success: false,
      error: {
        code: (error as Response).status,
        message: "unhandled error",
      },
    });
  }
}

export default function Layout() {
  return <AdminLoginPage />;
}
