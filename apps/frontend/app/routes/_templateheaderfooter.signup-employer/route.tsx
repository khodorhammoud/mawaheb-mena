/*  apps/frontend/app/routes/_templateheaderfooter.signup-employer/route.tsx  */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import SignUpEmployerPage from './Signup';

import {
  generateVerificationToken,
  getProfileInfo,
} from '../../servers/user.server';
import { sendEmail } from '../../servers/emails/emailSender.server';
import { authenticator } from '../../auth/auth.server';

import { RegistrationError } from '../../common/errors/UserError';
import type { Employer } from '@mawaheb/db/types';

/* ───────────────────────────── helpers ───────────────────────────── */

const duplicateEmailResponse = () =>
  json(
    {
      success: false,
      error: {
        message: 'The email address is already registered.',
        fieldErrors: { email: 'The email address is already registered.' },
      },
    },
    { status: 400 },
  );

/* ──────────────────────────── ACTION ─────────────────────────────── */

export async function action({ request }: ActionFunctionArgs) {
  try {
    /* 1. Basic field‑level validation */
    const formData      = await request.clone().formData();
    const email         = (formData.get('email')       ?? '').toString().trim();
    const firstName     = (formData.get('firstName')   ?? '').toString().trim();
    const lastName      = (formData.get('lastName')    ?? '').toString().trim();
    const password      = (formData.get('password')    ?? '').toString();
    const termsAccepted =  formData.get('termsAccepted');               // "on"

    const fieldErrors: Record<string, string> = {};
    if (!email)     fieldErrors.email     = 'Email Address is required';
    if (!firstName) fieldErrors.firstName = 'First Name is required';
    if (!lastName)  fieldErrors.lastName  = 'Last Name is required';
    if (!password)  fieldErrors.password  = 'Password is required';

    if (Object.keys(fieldErrors).length)
      return json({ success: false, error: { fieldErrors } }, 400);

    if (termsAccepted !== 'on')
      return json(
        {
          success: false,
          error: { message: 'You must accept the terms and conditions to proceed.' },
        },
        400,
      );

    /* 2. Attempt registration (catch duplicate‑email → 400) */
    let userId: number;
    try {
      userId = await authenticator.authenticate('register', request);
    } catch (err: unknown) {
      // remix‑auth‑form variants
      if (err instanceof RegistrationError && err.code === 'Email already exists')
        return duplicateEmailResponse();

      if (err instanceof Response) {
        /* NEW: treat any 401 as Duplicate E‑mail */
        if (err.status === 401) return duplicateEmailResponse();

        // JSON body fallback
        const body = await err.clone().json().catch(() => ({}));
        if (
          body?.error?.code === 'Email already exists' ||
          body?.error?.message?.toLowerCase()?.includes('email already exists') ||
          body?.message?.toLowerCase()?.includes('email already exists')
        )
          return duplicateEmailResponse();
      }

      // plain Error thrown by strategy
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes('email already exists')
      )
        return duplicateEmailResponse();

      throw err; // anything else bubbles to global handler
    }

    /* 3. Finish profile & send verification mail */
    const newEmployer = (await getProfileInfo({ userId })) as Employer | null;
    if (!newEmployer)
      return json(
        {
          success: false,
          error: { message: 'Failed to register user. Please try again later.' },
        },
        500,
      );

    const token = await generateVerificationToken(userId);
    await sendEmail({
      type: 'accountVerification',
      email,
      name: `${firstName} ${lastName}`,
      data: {
        verificationLink: `${process.env.HOST_URL}/verify-account?token=${token}`,
      },
    });

    return json({ success: true, newEmployer });
  } catch (err: unknown) {
    /* final safety‑net – still convert dup‑email to 400 */
    if (err instanceof RegistrationError && err.code === 'Email already exists')
      return duplicateEmailResponse();
    if (
      err instanceof Error &&
      err.message.toLowerCase().includes('email already exists')
    )
      return duplicateEmailResponse();

    console.error('[Signup Employer Error]', err);
    return json(
      {
        success: false,
        error: { message: 'An unexpected error occurred. Please try again later.' },
      },
      500,
    );
  }
}

/* ──────────────────────────── LOADER ─────────────────────────────── */

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (user) return json({ redirect: '/dashboard' });
  return json({ success: false });
}

/* ──────────────────────────── PAGE SHELL ─────────────────────────── */

export default function Layout() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.8 }}>
      <SignUpEmployerPage />
    </div>
  );
}
