import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export interface AccountVerificationEmailParams {
  verificationLink: string;
}

export function generateAccountVerificationEmail(
  params: AccountVerificationEmailParams
): string {
  // Get the current file's directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Construct the path to the template
  const templatePath = path.join(
    __dirname,
    "../templates/accountVerificationEmail.html"
  );

  // Read the template file
  let template = fs.readFileSync(templatePath, "utf-8");

  // Replace the placeholder with actual data
  template = template.replace("{{verificationLink}}", params.verificationLink);

  return template;
}
