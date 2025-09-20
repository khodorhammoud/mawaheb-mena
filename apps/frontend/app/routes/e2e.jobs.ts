import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { getCurrentUser } from '~/servers/user.server';
import { db } from '@mawaheb/db/server';
import { accountsTable, employersTable } from '@mawaheb/db';
import { AccountType } from '@mawaheb/db/enums';
import { eq } from 'drizzle-orm';

import {
  countEmployerJobs,
  countEmployerApplications,
  resetEmployerApplicationsToZero,
  resetEmployerJobsToZeroWithDebug,
  seedEmployerJobs,
} from '~/servers/test.server';

const TAG = '[e2e.jobs]';

export async function action({ request }: ActionFunctionArgs) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(`${TAG} blocked in production`);
    return json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  try {
    console.log(`${TAG} action method=${request.method}`);

    const user = await getCurrentUser(request);
    if (!user) {
      console.warn(`${TAG} unauthorized`);
      return json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    console.log(`${TAG} user.id=${user.id}`);

    const [account] = await db
      .select({ id: accountsTable.id, accountType: accountsTable.accountType })
      .from(accountsTable)
      .where(eq(accountsTable.userId, user.id));

    if (!account) {
      console.warn(`${TAG} account not found for user=${user.id}`);
      return json({ ok: false, error: 'account not found' }, { status: 404 });
    }
    if (account.accountType !== AccountType.Employer) {
      console.warn(`${TAG} requires employer. accountType=${account.accountType}`);
      return json({ ok: false, error: 'requires employer' }, { status: 400 });
    }

    const [emp] = await db
      .select({ id: employersTable.id })
      .from(employersTable)
      .where(eq(employersTable.accountId, account.id));

    if (!emp) {
      console.warn(`${TAG} employer not found for account=${account.id}`);
      return json({ ok: false, error: 'employer not found' }, { status: 404 });
    }

    const employerId = emp.id;
    console.log(`${TAG} resolved accountId=${account.id} employerId=${employerId}`);

    const form = await request.formData();
    const op = String(form.get('op') ?? '');
    const debug = String(form.get('debug') ?? '') === '1';
    const seedCount = Number(form.get('count') ?? 0) || 0;
    const status = String(form.get('status') ?? 'active');

    console.log(`${TAG} op=${op} debug=${debug} seedCount=${seedCount} status=${status}`);

    if (op === 'reset') {
      const res = await resetEmployerJobsToZeroWithDebug(employerId);
      console.log(`${TAG} reset result=`, res);
      return json({
        ok: true,
        op,
        ...res,
        ...(debug ? { debug: { userId: user.id, accountId: account.id, employerId } } : {}),
      });
    }

    if (op === 'reset-apps') {
      const res = await resetEmployerApplicationsToZero(employerId);
      console.log(`${TAG} reset-apps result=`, res);
      return json({
        ok: true,
        op,
        ...res,
        ...(debug ? { debug: { userId: user.id, accountId: account.id, employerId } } : {}),
      });
    }

    if (op === 'count') {
      const jobs = await countEmployerJobs(employerId);
      const apps = await countEmployerApplications(employerId);
      console.log(`${TAG} count -> jobs=${jobs} apps=${apps}`);
      return json({
        ok: true,
        op,
        jobs,
        applications: apps,
        ...(debug ? { debug: { userId: user.id, accountId: account.id, employerId } } : {}),
      });
    }

    if (op === 'seed') {
      const inserted = await seedEmployerJobs(employerId, seedCount, { status });
      const jobs = await countEmployerJobs(employerId);
      const apps = await countEmployerApplications(employerId);
      console.log(`${TAG} seed -> inserted=${inserted} jobs=${jobs} apps=${apps}`);
      return json({
        ok: true,
        op,
        inserted,
        jobs,
        applications: apps,
        ...(debug ? { debug: { userId: user.id, accountId: account.id, employerId } } : {}),
      });
    }

    console.warn(`${TAG} unknown op=${op}`);
    return json({ ok: false, error: 'unknown op' }, { status: 400 });
  } catch (err: any) {
    console.error(`${TAG} error:`, err);
    return json(
      { ok: false, error: 'internal', message: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

export function loader(_: LoaderFunctionArgs) {
  console.log(`${TAG} GET -> 405`);
  return json({ ok: false, error: 'POST only' }, { status: 405 });
}
