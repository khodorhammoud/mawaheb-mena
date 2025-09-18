// email server with brevo
import brevo from '@getbrevo/brevo';
import {
  generateAccountVerificationEmail,
  AccountVerificationEmailParams,
} from './accountVerificationEmail';

import { hash } from 'bcrypt-ts';

// import node mailer
import nodemailer from 'nodemailer';
import { smtpConfigNodeMailer } from './smtpConfig';

type EmailType = 'accountVerification'; //| 'resetPassword' | 'notification';

interface SendEmailParams {
  email: string;
  name: string;
  subject?: string;
  type: EmailType;
  data: AccountVerificationEmailParams; // | ResetPasswordParams | NotificationParams; // Add other types as needed
}
interface MailOptions {
  from: string;
  email: string;
  name: string;
  subject: string;
  html: string;
}
interface NodeMailerMailOptions {
  from: string;
  to: string;
  name: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams) {
  let htmlContent: string;

  switch (params.type) {
    case 'accountVerification':
      htmlContent = generateAccountVerificationEmail(params.data);
      params.subject = 'Account Verification';
      break;
    default:
      throw new Error('Invalid email type');
  }

  const mailOptions: NodeMailerMailOptions = {
    from: process.env.EMAIL_FROM,
    to: params.email,
    name: params.name,
    subject: params.subject,
    html: htmlContent,
  };

  console.log('mailOptions', mailOptions);
  // await sendEmailWithBrevo(mailOptions);
  await sendEmailWithNodeMailer(mailOptions);
}

export async function sendEmailWithNodeMailer(mailOptions: NodeMailerMailOptions) {
  const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const messageInfo = await transporter.sendMail(mailOptions);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(messageInfo));
  } catch (error) {
    console.error('Failed to send email with NodeMailer', error);
    throw new Error('Failed to send email with NodeMailer', error);
  }
}

// TODO change brevo API
export async function sendEmailWithBrevo(mailOptions: MailOptions) {
  // skip sending real emails, if i am running a test, and also, use instead of the normal test command, that one here: $env:IS_E2E="true"; pnpm e2e e2e/auth/employer-signup.spec.ts
  if (process.env.IS_E2E === 'true') {
    console.log('Skipping real email send in E2E!');
    return;
  }

  const apiInstance = new brevo.TransactionalEmailsApi();

  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = mailOptions.subject;
  sendSmtpEmail.htmlContent = mailOptions.html;
  sendSmtpEmail.sender = { name: 'Mawaheb Mena', email: mailOptions.from };
  sendSmtpEmail.to = [{ email: mailOptions.email, name: mailOptions.name }];
  // generate hash
  sendSmtpEmail.headers = { MawahebMENA: crypto.randomUUID() };
  /* sendSmtpEmail.params = {
    parameter: "My param value",
    subject: "common subject",
  }; */

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log('API called successfully');
    },
    function (error) {
      console.error(error);
      throw new Error('Failed to send email with Brevo', error);
    }
  );
}
