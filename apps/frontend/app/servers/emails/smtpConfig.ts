export const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: false, // true for 465, false for other ports
};

export const smtpConfigNodeMailer = {
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '039953fd8d4d23',
    pass: 'df40160e455e54',
  },
  secure: false,
};
