import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import SignUpEmployerPage from './Signup';
import { generateVerificationToken, getProfileInfo } from '../../servers/user.server';
import { RegistrationError } from '../../common/errors/UserError';
import { sendEmail } from '../../servers/emails/emailSender.server';
import { authenticator } from '../../auth/auth.server';
import { Employer } from '@mawaheb/db/src/types/User';

export async function action({ request }: ActionFunctionArgs) {
  let newEmployer: Employer | null = null;

  try {
    const formData = await request.clone().formData();

    // Extract necessary fields
    const termsAccepted = formData.get('termsAccepted');
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');

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

    const userId = await authenticator.authenticate('register', request);

    newEmployer = (await getProfileInfo({ userId })) as Employer;

    if (!newEmployer) {
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

    return Response.json({ success: true, newEmployer });
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

  // SO !--IMPORTANT--!
  // If the user is authenticated, redirect to the dashboard.
  if (user) {
    return Response.json({ redirect: '/dashboard' });
  }

  // Otherwise, let them stay on the signup page.
  return Response.json({ success: false });
}

export default function Layout() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <SignUpEmployerPage />
    </div>
  );
}
