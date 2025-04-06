import { FormStrategy } from 'remix-auth-form';
import {
  getUserAccountType,
  getUser,
  registerEmployer,
  registerFreelancer,
  isAccountDeleted,
} from '../servers/user.server';
import { compare } from 'bcrypt-ts';
import { Employer, Freelancer } from '@mawaheb/db/src/types/User';
import { AccountType, EmployerAccountType, Provider } from '@mawaheb/db/src/types/enums';

export const loginStrategy = new FormStrategy(async ({ form }): Promise<number> => {
  let email = form.get('email') as string;
  const password = form.get('password') as string;
  const accountType = form.get('accountType') as string;
  email = email.toLowerCase().trim();
  console.log(email, password, accountType);
  const user = await getUser({ userEmail: email }, true);
  console.log(user);

  if (accountType === 'admin') {
    if (!user || user.role !== 'admin' || !(await compare(password, user.passHash!))) {
      throw new Error('Invalid admin credentials');
    }
    return user.id;
  }

  if (user && (await getUserAccountType(user.id!)) !== accountType) {
    throw new Error(`This ${accountType} account does not exist`);
  }

  if (!user || !(await compare(password, user.passHash!))) {
    throw new Error('Incorrect credentials');
  }

  if (!user.isVerified) throw new Error('Account not verified');

  // Check if account is deleted
  if (await isAccountDeleted(user.id!)) {
    throw new Error('This account has been deleted');
  }

  return user.id;
});

export const registerationStrategy = new FormStrategy(async ({ form }): Promise<number> => {
  const email = form.get('email') as string;
  const password = form.get('password') as string;
  const firstName = form.get('firstName') as string;
  const lastName = form.get('lastName') as string;
  const accountType = form.get('accountType') as string;
  const employerAccountType = form.get('employerAccountType') as EmployerAccountType;

  let profile: Employer | Freelancer = null;
  if (!password || !firstName || !lastName || !email) {
    throw new Error('Missing required fields for registration');
  }

  try {
    switch (accountType) {
      case AccountType.Employer:
        profile = await registerEmployer({
          account: {
            user: {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.toLowerCase().trim(),
              password,
            },
          },
          employerAccountType,
          provider: Provider.Credentials,
        } as Employer & { provider: Provider });

        break;
      case AccountType.Freelancer:
        profile = await registerFreelancer({
          account: {
            user: {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.toLowerCase().trim(),
              password,
            },
          },
          provider: Provider.Credentials,
        } as Freelancer & { provider: Provider });
        break;
      default:
        throw new Error('Invalid registration type');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to register user');
  }
  return profile.account.user.id;
});
