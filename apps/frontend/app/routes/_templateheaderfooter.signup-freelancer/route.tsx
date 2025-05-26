import SignUpFreelancerPage from './Signup';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import {
  generateVerificationToken,
  getProfileInfo,
  setUserVerified,
} from '../../servers/user.server';
import { RegistrationError } from '../../common/errors/UserError';
// import { sendEmail } from '../../servers/emails/emailSender.server';
import { authenticator } from '../../auth/auth.server';
import { Freelancer } from '@mawaheb/db/types';

// 🟢 library for password validation
import zxcvbn from 'zxcvbn';

export async function action({ request }: ActionFunctionArgs) {
  let newFreelancer: Freelancer | null = null;

  try {
    const formData = await request.clone().formData();

    // Extract necessary fields
    const termsAccepted = formData.get('termsAccepted');
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const password = formData.get('password') as string;

    const fieldErrors: Record<string, string> = {};
    if (!email) fieldErrors.email = 'Email Address is required';
    if (!firstName) fieldErrors.firstName = 'First Name is required';
    if (!lastName) fieldErrors.lastName = 'Last Name is required';
    if (!password) fieldErrors.password = 'Password is required';

    if (Object.keys(fieldErrors).length) {
      return Response.json({ success: false, error: { fieldErrors } }, { status: 400 });
    }

    // 🟢 zxcvbn password strength validation
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

    // Backend validation for terms acceptance
    if (!termsAccepted || termsAccepted !== 'on') {
      return Response.json(
        {
          success: false,
          error: {
            message: 'You must accept the terms and conditions to proceed.',
          },
        },
        { status: 400 }
      );
    }

    // 1. Register user and get their ID
    const userId = await authenticator.authenticate('register', request);

    // 2. Set isVerified = true directly in the DB (NO email verification)
    await setUserVerified(userId);

    // 3. Commented out: fetch profile and send verification mail
    /*
    newFreelancer = (await getProfileInfo({ userId })) as Freelancer;

    if (!newFreelancer) {
      return Response.json(
        {
          success: false,
          error: {
            message: 'Failed to register user. Please try again later.',
          },
        },
        { status: 500 }
      );
    }

    const verificationToken = await generateVerificationToken(userId);
    await sendEmail({
      type: 'accountVerification',
      email: email as string,
      name: (firstName || lastName) as string,
      data: {
        // TODO: change the verification link to the actual production URL
        verificationLink: `${process.env.HOST_URL}/verify-account?token=${verificationToken}`,
      },
    });

    return Response.json({ success: true, newFreelancer });
    */

    // 4. Redirect to /login after registration and setting isVerified
    return redirect('/login-freelancer');
  } catch (error) {
    if (error instanceof RegistrationError && error.code === 'Email already exists') {
      return Response.json(
        {
          success: false,
          error: { message: 'The email address is already registered.' },
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred. Please try again later.',
        },
      },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);

  if (user) {
    return Response.json({ redirect: '/dashboard' });
  }

  return Response.json({ success: false });
}

export default function Layout() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <SignUpFreelancerPage />
    </div>
  );
}
