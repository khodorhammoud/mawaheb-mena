import { useState, useEffect, useRef } from 'react';
import SocialLinks from '../../common/registration/socialLinks';
import { useActionData, useNavigate, Form } from '@remix-run/react';
import AppFormField from '../../common/form-fields';
import { AccountType } from '@mawaheb/db/enums';
import { Checkbox } from '~/components/ui/checkbox';
import zxcvbn from 'zxcvbn';

interface ActionData {
  success?: boolean;
  message?: string;
  redirectTo?: string;
  error?: {
    message?: string;
    fieldErrors?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      confirmPassword?: string;
    };
  };
}

interface PasswordStrength {
  score: number;
  feedback: {
    suggestions: string[];
    warning: string;
  };
}

export default function SignupLeftComponent() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const redirectionFlag = useRef(false);

  useEffect(() => {
    if (!redirectionFlag.current && actionData?.success && actionData?.redirectTo) {
      redirectionFlag.current = true;

      // Start countdown
      setRedirectCountdown(3);

      const countdownTimer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownTimer);
            navigate(actionData.redirectTo!);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [actionData, navigate]);

  const [employerAccountType, setEmployerAccountType] = useState('personal');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Calculate password strength in real-time
  useEffect(() => {
    if (password.length > 0) {
      const result = zxcvbn(password);
      setPasswordStrength({
        score: result.score,
        feedback: {
          suggestions: result.feedback.suggestions || [],
          warning: result.feedback.warning || '',
        },
      });
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Validate password confirmation
  useEffect(() => {
    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const isPasswordValid = passwordStrength && passwordStrength.score >= 3 && password.length >= 8;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto bg-white pl-2 pr-12 mt-20">
      <h1 className="text-6xl mb-8 self-start font-['BespokeSerif-Medium']">Sign Up</h1>

      {actionData?.success && actionData?.message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 w-full">
          <strong className="font-bold">✅ Success!</strong>
          <span className="block sm:inline ml-2">{actionData.message}</span>
          {redirectCountdown !== null && (
            <div className="text-sm mt-2">
              Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
            </div>
          )}
        </div>
      )}

      {(actionData?.error?.message || actionData?.error?.fieldErrors?.email) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 w-full">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">
            {actionData.error?.message || actionData.error?.fieldErrors?.email}
          </span>
        </div>
      )}

      <p className="text-xl font-semibold text-gray-800 self-start">Select user type</p>
      <p className="text-md text-gray-400 mb-6 self-start">
        You can change your account at any time
      </p>

      <div className="flex mb-6 space-x-4 lg:w-[450px] self-start">
        <button
          onClick={() => setEmployerAccountType('personal')}
          className={`flex-1 py-4 border rounded-xl text-sm font-medium ${
            employerAccountType === 'personal' ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
          }`}
        >
          <div className="flex flex-col items-center rounded-xl">
            <span className="text-4xl">👤</span>
            <span className="font-semibold text-lg">Personal</span>
            <span className="text-md">Set Up Your Dream Team</span>
          </div>
        </button>

        <button
          onClick={() => setEmployerAccountType('company')}
          className={`flex-1 py-4 border rounded-xl text-sm font-medium ${
            employerAccountType === 'company' ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl">🏢</span>
            <span className="font-semibold text-lg">Company</span>
            <span className="text-md">Hire Top Talent</span>
          </div>
        </button>
      </div>

      <Form method="post" className="w-full space-y-6">
        <input type="hidden" name="accountType" value={AccountType.Employer} />
        <input type="hidden" name="employerAccountType" value={employerAccountType} />

        <AppFormField
          id="email"
          name="email"
          label="Email Address"
          error={actionData?.error?.fieldErrors?.email}
        />

        <div className="flex space-x-4">
          <AppFormField
            className="w-1/2"
            id="firstName"
            name="firstName"
            label="First Name"
            error={actionData?.error?.fieldErrors?.firstName}
          />

          <AppFormField
            className="w-1/2"
            id="lastName"
            name="lastName"
            label="Last Name"
            error={actionData?.error?.fieldErrors?.lastName}
          />
        </div>

        <div className="space-y-2">
          <AppFormField
            type="password"
            id="password"
            name="password"
            label="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            error={actionData?.error?.fieldErrors?.password}
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength ? getStrengthColor(passwordStrength.score) : 'bg-gray-300'
                    }`}
                    style={{
                      width: passwordStrength
                        ? `${((passwordStrength.score + 1) / 5) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {passwordStrength ? getStrengthText(passwordStrength.score) : ''}
                </span>
              </div>

              {/* Password Requirements */}
              <div className="text-xs space-y-1">
                <div
                  className={`flex items-center space-x-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <span>{password.length >= 8 ? '✓' : '○'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${isPasswordValid ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <span>{isPasswordValid ? '✓' : '○'}</span>
                  <span>Good strength level</span>
                </div>
              </div>

              {/* Password Feedback */}
              {passwordStrength && passwordStrength.feedback.warning && (
                <div className="text-xs text-orange-600">{passwordStrength.feedback.warning}</div>
              )}

              {passwordStrength && passwordStrength.feedback.suggestions.length > 0 && (
                <div className="text-xs text-gray-600">
                  {passwordStrength.feedback.suggestions.join(' ')}
                </div>
              )}
            </div>
          )}
        </div>

        <AppFormField
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          error={confirmPasswordError || actionData?.error?.fieldErrors?.confirmPassword}
        />

        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3 ml-3">
            <Checkbox name="termsAccepted" id="termsAccepted" required className="peer" />
            <label htmlFor="termsAccepted" className="text-sm tracking-tight text-gray-500">
              I accept the{' '}
              <a
                href="/terms-and-conditions"
                className="text-primaryColor font-semibold hover:underline"
                rel="noopener noreferrer"
              >
                terms and conditions
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-white bg-primaryColor rounded-xl focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 focus:ring-offset-2 focus:ring-blue-500 not-active-gradient"
          >
            Continue
          </button>
        </div>

        {/* {actionData?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">✅ A verification email has been sent to you.</strong>
          </div>
        )} */}
      </Form>

      <div className="relative flex items-center justify-center mt-6 mb-2">
        <div className="flex-grow border border-gray-200 w-[270px] mt-1"></div>
        <span className="px-2">or</span>
        <div className="flex-grow border border-gray-200 w-[270px] mt-1"></div>
      </div>

      <SocialLinks />

      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/login-employer"
            className="text-primaryColor font-medium hover:underline underline-offset-2 no-underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
