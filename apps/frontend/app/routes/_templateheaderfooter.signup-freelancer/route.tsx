import SignUpFreelancerPage from './Signup';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { generateVerificationToken, getProfileInfo } from '../../servers/user.server';
import { RegistrationError } from '../../common/errors/UserError';
import { sendEmail } from '../../servers/emails/emailSender.server';
import { authenticator } from '../../auth/auth.server';
import { Freelancer } from '@mawaheb/db/types';

export async function action({ request }: ActionFunctionArgs) {
  let newFreelancer: Freelancer | null = null;

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
