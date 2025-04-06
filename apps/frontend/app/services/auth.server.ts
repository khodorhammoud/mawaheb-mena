import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import { sessionStorage } from '~/auth/session.server';
import {
  createSocialAccount,
  getProfileInfo,
  getSocialAccount,
  registerEmployer,
  registerFreelancer,
  verifyUserAccount,
} from '~/servers/user.server';
import { EmployerAccountType, Provider } from '@mawaheb/db/src/types/enums';
import { Freelancer, Employer } from '@mawaheb/db/src/types/User';

// Create an instance of the authenticator
export const authenticator = new Authenticator(sessionStorage);

const googleStrategyFreelancer = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL_FREELANCER!,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    const googleProfile = profile;
    if (!googleProfile || !googleProfile.emails) {
      console.error('No email found in Google profile');
      throw new Error('No email found in Google profile');
    }

    const email = googleProfile.emails[0]?.value;
    const emailVerified = googleProfile._json.email_verified;

    if (!emailVerified || !email) {
      console.error('Email not verified in Google profile');
      throw new Error('Email not verified in Google profile');
    }

    const userProfile = await getProfileInfo({ userEmail: email });
    if (userProfile) {
      // user already exists, so we need to login user
      // 1. check if the user has a social account with the same provider and provider_account_id
      const socialAccount = await getSocialAccount({
        userId: userProfile.account.user.id,
        provider: 'google',
      });
      // 2. if the user has a social account, then we need to login the user
      if (socialAccount) {
        return userProfile.account.user.id;
      }
      // 3. if the user does not have a social account, then we need to create a new social account and then login the user
      await createSocialAccount({
        userId: userProfile.account.user.id,
        provider: 'google',
        providerAccountId: googleProfile.id,
        profileUrl: googleProfile.photos[0]?.value,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: new Date(extraParams.expires_in * 1000),
      });
      return userProfile.account.user.id;
    }

    // 4. if the user does not exist, then we need to create a new user
    let newCreatedProfile: Freelancer | null;
    try {
      newCreatedProfile = await registerFreelancer({
        account: {
          user: {
            firstName: googleProfile._json.given_name.trim(),
            lastName: googleProfile._json.family_name.trim(),
            email: googleProfile._json.email.toLowerCase().trim(),
          },
        },
        provider: Provider.SocialAccount,
      } as Freelancer & { provider: Provider });
    } catch (error) {
      console.error('error in registerFreelancer with google strategy', error);
      throw new Error('Failed to register user');
    }
    if (!newCreatedProfile) {
      console.error('newCreatedProfile is null');
      throw new Error('Failed to register user');
    }
    // verify user account
    await verifyUserAccount({ userId: newCreatedProfile.account.user.id });
    await createSocialAccount({
      userId: newCreatedProfile.account.user.id,
      provider: 'google',
      providerAccountId: googleProfile.id,
      profileUrl: googleProfile.photos[0]?.value,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: new Date(extraParams.expires_in * 1000),
    });

    return newCreatedProfile.account.user.id;
  }
);

const googleStrategyEmployer = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL_EMPLOYER!,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    const googleProfile = profile;

    if (!googleProfile || !googleProfile.emails) {
      throw new Error('No email found in Google profile');
    }

    const email = googleProfile.emails[0]?.value;
    const emailVerified = googleProfile._json.email_verified;

    if (!emailVerified || !email) {
      throw new Error('Email not verified in Google profile');
    }

    const userProfile = await getProfileInfo({ userEmail: email });
    if (userProfile) {
      // user already exists, so we need to login user
      // 1. check if the user has a social account with the same provider and provider_account_id
      const socialAccount = await getSocialAccount({
        userId: userProfile.account.user.id,
        provider: 'google',
      });
      // 2. if the user has a social account, then we need to login the user
      if (socialAccount) {
        return userProfile.account.user.id;
      }

      // 3. if the user does not have a social account, then we need to create a new social account and then login the user
      await createSocialAccount({
        userId: userProfile.account.user.id,
        provider: 'google',
        providerAccountId: googleProfile.id,
        profileUrl: googleProfile.photos[0]?.value,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: new Date(extraParams.expires_in * 1000),
      });
      return userProfile.account.user.id;
    }

    // 4. if the user does not exist, then we need to create a new user
    let newCreatedProfile: Employer | null;
    try {
      newCreatedProfile = await registerEmployer({
        account: {
          user: {
            firstName: googleProfile._json.given_name.trim(),
            lastName: googleProfile._json.family_name.trim(),
            email: googleProfile._json.email.toLowerCase().trim(),
          },
        },
        employerAccountType: EmployerAccountType.Personal,
        provider: Provider.SocialAccount,
      } as Employer & { provider: Provider });
    } catch (error) {
      console.error(error);
      throw new Error('Failed to register user');
    }
    if (!newCreatedProfile) {
      throw new Error('Failed to register user');
    }
    // verify user account
    await verifyUserAccount({ userId: newCreatedProfile.account.user.id });
    await createSocialAccount({
      userId: newCreatedProfile.account.user.id,
      provider: 'google',
      providerAccountId: googleProfile.id,
      profileUrl: googleProfile.photos[0]?.value,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: new Date(extraParams.expires_in * 1000),
    });

    return newCreatedProfile.account.user.id;
  }
);
authenticator.use(googleStrategyFreelancer, 'google_freelancer');
authenticator.use(googleStrategyEmployer, 'google_employer');
