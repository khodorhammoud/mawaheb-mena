import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { requireAdmin } from '~/auth/auth.server';
import { db } from '~/db/drizzle/connector';
import { adminBankAccountsTable } from '~/db/drizzle/schemas/schema';
import { eq, and, not } from 'drizzle-orm';

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { accountId } = params;

  if (!accountId) {
    return redirect('/admin-dashboard/payments');
  }

  try {
    // Set this account as default
    await db
      .update(adminBankAccountsTable)
      .set({ isDefault: true })
      .where(eq(adminBankAccountsTable.id, parseInt(accountId, 10)));

    // Set all other accounts as non-default
    await db
      .update(adminBankAccountsTable)
      .set({ isDefault: false })
      .where(
        and(
          eq(adminBankAccountsTable.isDefault, true),
          not(eq(adminBankAccountsTable.id, parseInt(accountId, 10)))
        )
      );

    return redirect('/admin-dashboard/payments?success=Account+set+as+default');
  } catch (error) {
    console.error('Error setting default account:', error);
    return redirect('/admin-dashboard/payments?error=Failed+to+set+default+account');
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // We handle everything in the loader for this route
  return null;
}

export default function SetDefaultAccount() {
  return null; // This component doesn't render anything, it just redirects
}
