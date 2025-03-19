import { db } from '~/db/drizzle/connector';
// import { db } from '../../../db/drizzle/db.server';
import { eq, and, not, or } from 'drizzle-orm';
import {
  bankAccountsTable,
  paymentsTable,
  adminBankAccountsTable,
  paymentStatusEnum,
  paymentTypeEnum,
  employersTable,
  freelancersTable,
} from '~/db/drizzle/schemas/schema';
import { UsersTable } from '~/db/drizzle/schemas/schema';
import { tarabutService, BankAccount, PaymentDetails } from '~/services/tarabut.service';
import { getUser } from './user.server';

// Type for bank account creation or update
export type BankAccountInput = {
  accountHolderName: string;
  accountNumber: string;
  iban?: string;
  bankName: string;
  branchCode?: string;
  swiftCode?: string;
  currency?: string;
};

// Type for payment creation
export type PaymentInput = {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  fromAccountId: string;
  toAccountId: string;
};

/**
 * Get bank account for a user
 */
export async function getUserBankAccount(userId: number) {
  try {
    const bankAccount = await db.query.bankAccountsTable.findFirst({
      where: eq(bankAccountsTable.userId, userId),
    });

    return bankAccount;
  } catch (error) {
    console.error('Error getting user bank account:', error);
    throw error;
  }
}

/**
 * Create or update bank account for a user
 */
export async function saveUserBankAccount(userId: number, bankAccountData: BankAccountInput) {
  try {
    // Check if user exists
    const user = await getUser({ userId });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if bank account already exists for this user
    const existingAccount = await getUserBankAccount(userId);

    if (existingAccount) {
      // Update existing account
      await db
        .update(bankAccountsTable)
        .set({
          accountHolderName: bankAccountData.accountHolderName,
          accountNumber: bankAccountData.accountNumber,
          iban: bankAccountData.iban,
          bankName: bankAccountData.bankName,
          branchCode: bankAccountData.branchCode,
          swiftCode: bankAccountData.swiftCode,
          currency: bankAccountData.currency || 'USD',
          updatedAt: new Date(),
        })
        .where(eq(bankAccountsTable.id, existingAccount.id));

      // If the account is already registered with the payment gateway, update it there too
      if (existingAccount.gatewayAccountId && tarabutService) {
        await tarabutService.updateBankAccount(existingAccount.gatewayAccountId, bankAccountData);
      }

      return {
        ...existingAccount,
        ...bankAccountData,
      };
    } else {
      // Create new account in our database
      const [newBankAccount] = await db
        .insert(bankAccountsTable)
        .values({
          userId,
          accountHolderName: bankAccountData.accountHolderName,
          accountNumber: bankAccountData.accountNumber,
          iban: bankAccountData.iban,
          bankName: bankAccountData.bankName,
          branchCode: bankAccountData.branchCode,
          swiftCode: bankAccountData.swiftCode,
          currency: bankAccountData.currency || 'USD',
        })
        .returning();

      // Register with payment gateway if available
      if (tarabutService) {
        try {
          const response = await tarabutService.registerBankAccount(
            userId,
            bankAccountData as BankAccount
          );

          // Save the gateway account ID in our database
          await db
            .update(bankAccountsTable)
            .set({
              gatewayAccountId: response.accountId,
            })
            .where(eq(bankAccountsTable.id, newBankAccount.id));

          newBankAccount.gatewayAccountId = response.accountId;
        } catch (gatewayError) {
          console.error('Failed to register with payment gateway:', gatewayError);
          // We don't throw here to allow the bank account to be saved locally
          // even if there's an issue with the payment gateway
        }
      }

      return newBankAccount;
    }
  } catch (error) {
    console.error('Error saving user bank account:', error);
    throw error;
  }
}

/**
 * Delete bank account for a user
 */
export async function deleteUserBankAccount(userId: number) {
  try {
    await db.delete(bankAccountsTable).where(eq(bankAccountsTable.userId, userId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting user bank account:', error);
    throw error;
  }
}

/**
 * Get admin bank accounts
 */
export async function getAdminBankAccounts() {
  try {
    const accounts = await db.query.adminBankAccountsTable.findMany();
    return accounts;
  } catch (error) {
    console.error('Error getting admin bank accounts:', error);
    throw error;
  }
}

/**
 * Get default admin bank account
 */
export async function getDefaultAdminBankAccount() {
  try {
    const account = await db.query.adminBankAccountsTable.findFirst({
      where: eq(adminBankAccountsTable.isDefault, true),
    });

    if (!account) {
      const firstAccount = await db.query.adminBankAccountsTable.findFirst();
      return firstAccount;
    }

    return account;
  } catch (error) {
    console.error('Error getting default admin bank account:', error);
    throw error;
  }
}

/**
 * Save admin bank account
 */
export async function saveAdminBankAccount(
  bankAccountData: BankAccountInput & { isDefault?: boolean }
) {
  try {
    const { isDefault, ...accountData } = bankAccountData;

    // Create new account in our database
    const [newBankAccount] = await db
      .insert(adminBankAccountsTable)
      .values({
        accountHolderName: accountData.accountHolderName,
        accountNumber: accountData.accountNumber,
        iban: accountData.iban,
        bankName: accountData.bankName,
        branchCode: accountData.branchCode,
        swiftCode: accountData.swiftCode,
        currency: accountData.currency || 'USD',
        isDefault: isDefault || false,
      })
      .returning();

    // If this account is set as default, unset any other default accounts
    if (isDefault) {
      await db
        .update(adminBankAccountsTable)
        .set({ isDefault: false })
        .where(
          and(
            eq(adminBankAccountsTable.isDefault, true),
            not(eq(adminBankAccountsTable.id, newBankAccount.id))
          )
        );
    }

    // Register with payment gateway if available
    if (tarabutService) {
      try {
        const response = await tarabutService.registerBankAccount(
          1, // TODO: check this
          accountData as BankAccount
        );

        // Save the gateway account ID in our database
        await db
          .update(adminBankAccountsTable)
          .set({
            gatewayAccountId: response.accountId,
          })
          .where(eq(adminBankAccountsTable.id, newBankAccount.id));

        newBankAccount.gatewayAccountId = response.accountId;
      } catch (gatewayError) {
        console.error('Failed to register admin account with payment gateway:', gatewayError);
      }
    }

    return newBankAccount;
  } catch (error) {
    console.error('Error saving admin bank account:', error);
    throw error;
  }
}

/**
 * Create a payment from employer to platform
 */
export async function createEmployerPayment(
  employerId: number,
  paymentInput: Omit<PaymentInput, 'toAccountId'>
) {
  try {
    // Get the admin account to receive the payment
    const adminAccount = await getDefaultAdminBankAccount();
    if (!adminAccount || !adminAccount.gatewayAccountId) {
      throw new Error('No admin bank account configured for payments');
    }

    // Get the employer's bank account
    const employerUser = await db.query.employersTable.findFirst({
      where: eq(employersTable.id, employerId),
      with: {
        account: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!employerUser || !employerUser.account || !employerUser.account.user) {
      throw new Error('Employer account not found');
    }

    const userId = employerUser.account.user.id;
    const employerBankAccount = await getUserBankAccount(userId);

    if (!employerBankAccount || !employerBankAccount.gatewayAccountId) {
      throw new Error('Employer has no bank account configured');
    }

    // Create a record in our database first
    const [payment] = await db
      .insert(paymentsTable)
      .values({
        type: 'employer_to_platform',
        amount: paymentInput.amount,
        currency: paymentInput.currency || 'USD',
        description: paymentInput.description,
        reference: paymentInput.reference,
        status: 'pending',
        sourceUserId: userId,
        employerId,
        sourceBankAccountId: employerBankAccount.id,
        destinationBankAccountId: adminAccount.id,
      })
      .returning();

    // If Tarabut service is available, create the payment there
    if (tarabutService) {
      try {
        const gatewayPayment = await tarabutService.createPaymentFromEmployer({
          amount: paymentInput.amount,
          currency: paymentInput.currency || 'USD',
          description: paymentInput.description,
          reference: paymentInput.reference || payment.id,
          fromAccount: employerBankAccount.gatewayAccountId,
          toAccount: adminAccount.gatewayAccountId,
        });

        // Update our record with the gateway payment ID
        await db
          .update(paymentsTable)
          .set({
            gatewayPaymentId: gatewayPayment.paymentId,
          })
          .where(eq(paymentsTable.id, payment.id));

        return {
          paymentId: payment.id,
          gatewayPaymentId: gatewayPayment.paymentId,
          redirectUrl: gatewayPayment.redirectUrl,
        };
      } catch (gatewayError) {
        console.error('Failed to create payment in gateway:', gatewayError);

        // Update payment status to failed
        await db
          .update(paymentsTable)
          .set({
            status: 'failed',
          })
          .where(eq(paymentsTable.id, payment.id));

        throw gatewayError;
      }
    }

    // Return just the payment ID if no gateway is available
    return {
      paymentId: payment.id,
    };
  } catch (error) {
    console.error('Error creating employer payment:', error);
    throw error;
  }
}

/**
 * Create a payment from platform to freelancer
 */
export async function createFreelancerPayment(
  freelancerId: number,
  paymentInput: Omit<PaymentInput, 'fromAccountId'>
) {
  try {
    // Get the admin account to make the payment from
    const adminAccount = await getDefaultAdminBankAccount();
    if (!adminAccount || !adminAccount.gatewayAccountId) {
      throw new Error('No admin bank account configured for payments');
    }

    // Get the freelancer's bank account
    const freelancerUser = await db.query.freelancersTable.findFirst({
      where: eq(freelancersTable.id, freelancerId),
      with: {
        account: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!freelancerUser || !freelancerUser.account || !freelancerUser.account.user) {
      throw new Error('Freelancer account not found');
    }

    const userId = freelancerUser.account.user.id;
    const freelancerBankAccount = await getUserBankAccount(userId);

    if (!freelancerBankAccount || !freelancerBankAccount.gatewayAccountId) {
      throw new Error('Freelancer has no bank account configured');
    }

    // Create a record in our database first
    const [payment] = await db
      .insert(paymentsTable)
      .values({
        type: 'platform_to_freelancer',
        amount: paymentInput.amount,
        currency: paymentInput.currency || 'USD',
        description: paymentInput.description,
        reference: paymentInput.reference,
        status: 'pending',
        destinationUserId: userId,
        freelancerId,
        sourceBankAccountId: adminAccount.id,
        destinationBankAccountId: freelancerBankAccount.id,
      })
      .returning();

    // If Tarabut service is available, create the payment there
    if (tarabutService) {
      try {
        const gatewayPayment = await tarabutService.createPaymentToFreelancer({
          amount: paymentInput.amount,
          currency: paymentInput.currency || 'USD',
          description: paymentInput.description,
          reference: paymentInput.reference || payment.id,
          fromAccount: adminAccount.gatewayAccountId,
          toAccount: freelancerBankAccount.gatewayAccountId,
        });

        // Update our record with the gateway payment ID
        await db
          .update(paymentsTable)
          .set({
            gatewayPaymentId: gatewayPayment.paymentId,
            status: 'processing', // Disbursements are processed immediately
          })
          .where(eq(paymentsTable.id, payment.id));

        return {
          paymentId: payment.id,
          gatewayPaymentId: gatewayPayment.paymentId,
        };
      } catch (gatewayError) {
        console.error('Failed to create payment in gateway:', gatewayError);

        // Update payment status to failed
        await db
          .update(paymentsTable)
          .set({
            status: 'failed',
          })
          .where(eq(paymentsTable.id, payment.id));

        throw gatewayError;
      }
    }

    // Return just the payment ID if no gateway is available
    return {
      paymentId: payment.id,
    };
  } catch (error) {
    console.error('Error creating freelancer payment:', error);
    throw error;
  }
}

/**
 * Update payment status from the gateway callback
 */
export async function updatePaymentStatus(gatewayPaymentId: string, status: string) {
  try {
    const payment = await db.query.paymentsTable.findFirst({
      where: eq(paymentsTable.gatewayPaymentId, gatewayPaymentId),
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    let newStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

    // Map gateway status to our status
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        newStatus = 'completed';
        break;
      case 'processing':
      case 'pending':
        newStatus = 'processing';
        break;
      case 'failed':
      case 'rejected':
        newStatus = 'failed';
        break;
      case 'refunded':
        newStatus = 'refunded';
        break;
      default:
        newStatus = 'processing';
    }

    // Update payment status
    await db
      .update(paymentsTable)
      .set({
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : undefined,
      })
      .where(eq(paymentsTable.id, payment.id));

    return { success: true };
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

/**
 * Get all payments for a user (employer or freelancer)
 */
export async function getUserPayments(userId: number) {
  try {
    const payments = await db.query.paymentsTable.findMany({
      where: or(
        eq(paymentsTable.sourceUserId, userId),
        eq(paymentsTable.destinationUserId, userId)
      ),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    return payments;
  } catch (error) {
    console.error('Error getting user payments:', error);
    throw error;
  }
}

/**
 * Get all payments (admin only)
 */
export async function getAllPayments() {
  try {
    const payments = await db.query.paymentsTable.findMany({
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
      with: {
        sourceUser: true,
        destinationUser: true,
      },
    });

    return payments;
  } catch (error) {
    console.error('Error getting all payments:', error);
    throw error;
  }
}
