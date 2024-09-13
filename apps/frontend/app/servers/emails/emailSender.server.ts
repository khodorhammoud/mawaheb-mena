// email server with brevo
import brevo from "@getbrevo/brevo";
import {
  generateAccountVerificationEmail,
  AccountVerificationEmailParams,
} from "./types/accountVerificationEmail";

type EmailType = "accountVerification"; //| 'resetPassword' | 'notification';

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

export async function sendEmail(params: SendEmailParams) {
  let htmlContent: string;

  switch (params.type) {
    case "accountVerification":
      htmlContent = generateAccountVerificationEmail(params.data);
      params.subject = "Account Verification";
      break;
    default:
      throw new Error("Invalid email type");
  }

  const mailOptions: MailOptions = {
    from: process.env.EMAIL_FROM,
    email: params.email,
    name: params.name,
    subject: params.subject,
    html: htmlContent,
  };
  await sendEmailWithBrevo(mailOptions);
}

// TODO change brevo API
export async function sendEmailWithBrevo(mailOptions: MailOptions) {
  const apiInstance = new brevo.TransactionalEmailsApi();

  const apiKey = apiInstance.authentications["apiKey"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = mailOptions.subject;
  sendSmtpEmail.htmlContent = mailOptions.html;
  sendSmtpEmail.sender = { name: "Mawaheb Mena", email: mailOptions.from };
  sendSmtpEmail.to = [{ email: mailOptions.email, name: mailOptions.name }];
  /* sendSmtpEmail.replyTo = {
    email: "khodorhammoud94@gmail.com",
    name: "Shubham Upadhyay",
  }; */
  sendSmtpEmail.headers = { MawahebMENA: "unique-id-1234" };
  /* sendSmtpEmail.params = {
    parameter: "My param value",
    subject: "common subject",
  }; */

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error);
      throw new Error("Failed to send email with Brevo", error);
    }
  );
}
