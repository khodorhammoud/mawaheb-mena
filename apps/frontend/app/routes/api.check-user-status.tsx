import { LoaderFunction, json } from '@remix-run/node';
import { getCurrentUserAccountInfo } from '~/servers/user.server';

export const loader: LoaderFunction = async ({ request }) => {
  // Get the current user account info
  const userAccount = await getCurrentUserAccountInfo(request);

  if (!userAccount) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  // Return the status
  return json({
    accountStatus: userAccount.accountStatus,
  });
};
