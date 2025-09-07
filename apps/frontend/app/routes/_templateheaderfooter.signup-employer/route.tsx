/*  apps/frontend/app/routes/_templateheaderfooter.signup-employer/route.tsx  */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import SignUpEmployerPage from './Signup';

import {
  generateVerificationToken,
  getProfileInfo,
  verifyUserAccount,
} from '../../servers/user.server';
import { sendEmail } from '../../servers/emails/emailSender.server';
import { authenticator } from '../../auth/auth.server';

import { RegistrationError } from '../../common/errors/UserError';
import type { Employer } from '@mawaheb/db/types';

// library for password validation
import zxcvbn from 'zxcvbn';

/* ───────────────────────────── helpers ───────────────────────────── */

const duplicateEmailResponse = () =>
  Response.json(
    {
      success: false,
      error: {
        message: 'The email address is already registered.',
        fieldErrors: { email: 'The email address is already registered.' },
      },
    },
    { status: 400 }
  );

/* ──────────────────────────── ACTION ─────────────────────────────── */

export async function action({ request }: ActionFunctionArgs) {
  try {
    /* 1. Basic field‑level validation */
    const formData = await request.clone().formData();
    const email = (formData.get('email') ?? '').toString().trim();
    const firstName = (formData.get('firstName') ?? '').toString().trim();
    const lastName = (formData.get('lastName') ?? '').toString().trim();
    const password = (formData.get('password') ?? '').toString();
    const confirmPassword = (formData.get('confirmPassword') ?? '').toString();
    const termsAccepted = formData.get('termsAccepted'); // "on"

    const fieldErrors: Record<string, string> = {};
    if (!email) fieldErrors.email = 'Email Address is required';
    if (!firstName) fieldErrors.firstName = 'First Name is required';
    if (!lastName) fieldErrors.lastName = 'Last Name is required';
    if (!password) fieldErrors.password = 'Password is required';
    if (!confirmPassword) fieldErrors.confirmPassword = 'Password confirmation is required';

    // Password confirmation validation
    if (password && confirmPassword && password !== confirmPassword) {
      fieldErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(fieldErrors).length)
      return Response.json({ success: false, error: { fieldErrors } }, { status: 400 });

    // 🟢 password strength validation with zxcvbn
    const pwdResult = zxcvbn(password);
    // Accept only if score is 3 or above (good/strong)
    if (pwdResult.score < 3) {
      return Response.json(
        {
          success: false,
          error: {
            message: 'Password is too weak.',
            fieldErrors: {
              password:
                (pwdResult.feedback.suggestions && pwdResult.feedback.suggestions.join(' ')) ||
                'Password is too weak. Try adding numbers, symbols, or making it longer.',
            },
          },
        },
        { status: 400 }
      );
    }

    // 🟢 (Optional, but recommended): minimum length check
    if (password.length < 8) {
      return Response.json(
        {
          success: false,
          error: {
            fieldErrors: { password: 'Password must be at least 8 characters.' },
          },
        },
        { status: 400 }
      );
    }

    if (termsAccepted !== 'on')
      return Response.json(
        {
          success: false,
          error: { message: 'You must accept the terms and conditions to proceed.' },
        },
        { status: 400 }
      );

    /* 2. Attempt registration (catch duplicate‑email → 400) */
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
        const body = await err
          .clone()
          .json()
          .catch(() => ({}));
        if (
          body?.error?.code === 'Email already exists' ||
          body?.error?.message?.toLowerCase()?.includes('email already exists') ||
          body?.message?.toLowerCase()?.includes('email already exists')
        )
          return duplicateEmailResponse();
      }

      // plain Error thrown by strategy
      if (err instanceof Error && err.message.toLowerCase().includes('email already exists'))
        return duplicateEmailResponse();

      throw err; // anything else bubbles to global handler
    }

    /* 3. Set isVerified = true for this user (instead of sending verification email) */
    await verifyUserAccount({ userId }); // ✅ No ts-expect-error, full type safety

    /* 4. Commented out: Finish profile & send verification mail */
    /*
    const newEmployer = (await getProfileInfo({ userId })) as Employer | null;
    if (!newEmployer)
      return json(
        {
          success: false,
          error: { message: 'Failed to register user. Please try again later.' },
        },
        500
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
    */

    // 5. Return success response instead of immediate redirect
    return Response.json({
      success: true,
      message: 'Account created successfully! Please log in to continue.',
      // message: 'Account created successfully! You will be redirected to the login page.',
      // redirectTo: '/login-employer',
    });
  } catch (err: unknown) {
    /* final safety‑net – still convert dup‑email to 400 */
    if (err instanceof RegistrationError && err.code === 'Email already exists')
      return duplicateEmailResponse();
    if (err instanceof Error && err.message.toLowerCase().includes('email already exists'))
      return duplicateEmailResponse();

    console.error('[Signup Employer Error]', err);
    return Response.json(
      {
        success: false,
        error: { message: 'An unexpected error occurred. Please try again later.' },
      },
      { status: 500 }
    );
  }
}

/* ──────────────────────────── LOADER ─────────────────────────────── */

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (user) return Response.json({ redirect: '/dashboard' });
  return Response.json({ success: false });
}

/* ──────────────────────────── PAGE SHELL ─────────────────────────── */

export default function Layout() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.8 }}>
      <SignUpEmployerPage />
    </div>
  );
}
