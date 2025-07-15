// app/routes/auth.logout.tsx

import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { logout } from '~/auth/auth.server'; // Import your logout util

export const action = async ({ request }: ActionFunctionArgs) => {
  // Call your logout handler (it should clear the cookie/session)
  return logout(request);
};
