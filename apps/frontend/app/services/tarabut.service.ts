/**
 * Tarabut Payment Gateway Service
 * Documentation: https://docs.tarabut.com/docs/introduction
 */

import { z } from 'zod';

// Tarabut configuration validation schema
export const TarabutConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  sandboxMode: z.boolean().default(false),
  callbackUrl: z.string().url(),
});

export type TarabutConfig = z.infer<typeof TarabutConfigSchema>;

// Bank account information schema
export const BankAccountSchema = z.object({
  accountHolderName: z.string().min(1),
  accountNumber: z.string().min(1),
  iban: z.string().optional(),
  bankName: z.string().min(1),
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
  currency: z.string().default('USD'),
});

export type BankAccount = z.infer<typeof BankAccountSchema>;

// Payment details schema
export const PaymentDetailsSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  reference: z.string().optional(),
  fromAccount: z.string(), // Account ID sending the payment
  toAccount: z.string(), // Account ID receiving the payment
});

export type PaymentDetails = z.infer<typeof PaymentDetailsSchema>;

export class TarabutService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor(config: TarabutConfig) {
    const { clientId, clientSecret, sandboxMode, callbackUrl } = config;

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.callbackUrl = callbackUrl;
    this.baseUrl = sandboxMode
      ? 'https://api.sandbox.tarabut.com/v1'
      : 'https://api.tarabut.com/v1';
  }

  private async getAuthToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw error;
    }
  }

  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Request failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Register a bank account for a user in the payment gateway
   */
  async registerBankAccount(
    userId: number,
    bankAccount: BankAccount
  ): Promise<{ accountId: string }> {
    try {
      return await this.makeRequest<{ accountId: string }>('/accounts', 'POST', {
        user_id: userId,
        account_holder_name: bankAccount.accountHolderName,
        account_number: bankAccount.accountNumber,
        iban: bankAccount.iban,
        bank_name: bankAccount.bankName,
        branch_code: bankAccount.branchCode,
        swift_code: bankAccount.swiftCode,
        currency: bankAccount.currency,
      });
    } catch (error) {
      console.error('Failed to register bank account:', error);
      throw error;
    }
  }

  /**
   * Get bank account details
   */
  async getBankAccount(accountId: string): Promise<BankAccount> {
    try {
      const response = await this.makeRequest<any>(`/accounts/${accountId}`);

      return {
        accountHolderName: response.account_holder_name,
        accountNumber: response.account_number,
        iban: response.iban,
        bankName: response.bank_name,
        branchCode: response.branch_code,
        swiftCode: response.swift_code,
        currency: response.currency,
      };
    } catch (error) {
      console.error('Failed to get bank account:', error);
      throw error;
    }
  }

  /**
   * Update bank account details
   */
  async updateBankAccount(
    accountId: string,
    bankAccount: Partial<BankAccount>
  ): Promise<{ success: boolean }> {
    try {
      const payload: Record<string, any> = {};

      if (bankAccount.accountHolderName)
        payload.account_holder_name = bankAccount.accountHolderName;
      if (bankAccount.accountNumber) payload.account_number = bankAccount.accountNumber;
      if (bankAccount.iban) payload.iban = bankAccount.iban;
      if (bankAccount.bankName) payload.bank_name = bankAccount.bankName;
      if (bankAccount.branchCode) payload.branch_code = bankAccount.branchCode;
      if (bankAccount.swiftCode) payload.swift_code = bankAccount.swiftCode;
      if (bankAccount.currency) payload.currency = bankAccount.currency;

      await this.makeRequest(`/accounts/${accountId}`, 'PATCH', payload);

      return { success: true };
    } catch (error) {
      console.error('Failed to update bank account:', error);
      throw error;
    }
  }

  /**
   * Create a payment from employer to the platform (admin)
   */
  async createPaymentFromEmployer(
    paymentDetails: PaymentDetails
  ): Promise<{ paymentId: string; redirectUrl: string }> {
    try {
      const response = await this.makeRequest<any>('/payments', 'POST', {
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        description: paymentDetails.description || 'Payment to platform',
        reference: paymentDetails.reference,
        source_account_id: paymentDetails.fromAccount,
        destination_account_id: paymentDetails.toAccount,
        callback_url: this.callbackUrl,
      });

      return {
        paymentId: response.payment_id,
        redirectUrl: response.redirect_url,
      };
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  }

  /**
   * Create a payment from admin to freelancer
   */
  async createPaymentToFreelancer(paymentDetails: PaymentDetails): Promise<{ paymentId: string }> {
    try {
      const response = await this.makeRequest<any>('/disbursements', 'POST', {
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        description: paymentDetails.description || 'Payment to freelancer',
        reference: paymentDetails.reference,
        source_account_id: paymentDetails.fromAccount,
        destination_account_id: paymentDetails.toAccount,
      });

      return {
        paymentId: response.disbursement_id,
      };
    } catch (error) {
      console.error('Failed to create disbursement:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    created_at: string;
  }> {
    try {
      return await this.makeRequest<any>(`/payments/${paymentId}`);
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  }

  /**
   * Get disbursement status
   */
  async getDisbursementStatus(disbursementId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    created_at: string;
  }> {
    try {
      return await this.makeRequest<any>(`/disbursements/${disbursementId}`);
    } catch (error) {
      console.error('Failed to get disbursement status:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance with configuration from environment variables
const createTarabutService = () => {
  const clientId = process.env.PAYMENT_GATEWAY_CLIENT_ID || '';
  const clientSecret = process.env.PAYMENT_GATEWAY_CLIENT_SECRET || '';
  const callbackUrl =
    process.env.PAYMENT_GATEWAY_CALLBACK || 'http://localhost:5173/payments/callback';
  const sandboxMode = process.env.NODE_ENV !== 'production';

  try {
    const config = TarabutConfigSchema.parse({
      clientId,
      clientSecret,
      sandboxMode,
      callbackUrl,
    });

    return new TarabutService(config);
  } catch (error) {
    console.error('Invalid Tarabut configuration:', error);
    // Return null instead of throwing to allow the app to load even with invalid config
    return null;
  }
};

export const tarabutService = createTarabutService();
