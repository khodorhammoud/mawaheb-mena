import OpenAI from "openai";
import * as mammoth from "mammoth";
import fs from "fs";
import path from "path";
// import * as pdfParse from "pdf-parse";
// import * as pdfjslib from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

const ALLOWED_FILE_TYPES = {
  PDF: "application/pdf",
  WORD: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB limit
const MIN_FILE_SIZE = 1024; // 1KB minimum
const MAX_PAGES = 10;

class Pdf {
  public static async getPageText(pdf: any, pageNo: number): Promise<string> {
    try {
      const page = await pdf.getPage(pageNo);
      const tokenizedText = await page.getTextContent();

      if (!tokenizedText?.items?.length) {
        return "";
      }

      const pageText = tokenizedText.items
        .map((token: any) => token.str)
        .join("")
        .trim();

      return pageText;
    } catch (error) {
      console.error(`Error extracting text from page ${pageNo}:`, error);
      return ""; // Return empty string for failed pages rather than breaking
    }
  }

  public static async getPDFText(source: ArrayBuffer): Promise<string> {
    if (!source || source.byteLength === 0) {
      throw new Error("Invalid PDF source provided");
    }

    try {
      const pdf = await pdfjsLib.getDocument(source).promise;
      if (pdf.numPages === 0) {
        throw new Error("PDF document appears to be empty");
      }
      const maxPages = Math.min(pdf.numPages, MAX_PAGES);
      const pageTextPromises = [];
      for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
        pageTextPromises.push(Pdf.getPageText(pdf, pageNo));
      }
      const pageTexts = await Promise.all(pageTextPromises);
      const combinedText = pageTexts.join(" ").trim();

      if (!combinedText) {
        throw new Error("No readable text found in PDF");
      }

      return combinedText;
    } catch (error) {
      throw new Error(`Error processing PDF: ${error}`);
    }
  }
}

export async function genParseCV(file: File) {
  // Validate file existence
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 10MB.");
  }
  if (file.size < MIN_FILE_SIZE) {
    throw new Error("File too small. Minimum size is 1KB.");
  }

  // Check if the file type is valid
  if (!Object.values(ALLOWED_FILE_TYPES).includes(file.type as any)) {
    throw new Error(
      "Invalid file type. Only PDF and Word documents are accepted."
    );
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  async function parseWithRetry(attempt = 1): Promise<any> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const cvContent = await parseFile(file);

      if (!cvContent || cvContent.length < 50) {
        // 50 characters is a very low threshold for a CV
        throw new Error("Insufficient content extracted from CV");
      }

      // Create completion with specific instructions
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Extract the following information from the below text, which is a CV and format it as a JSON object:
          - about: A brief professional summary
          - projects: Array of {projectName, projectDescription, projectLink}
          - workHistory: Array of {title, company, startDate, endDate, currentlyWorkingThere, jobDescription}
          - certificates: Array of {name, issuer, issueDate}
          - education: Array of {degree, institution, graduationYear}
          
          Ensure dates are in ISO format (YYYY-MM-DD) and all text fields are properly escaped.
          
          the output JSON format must be of the following format:
          {
            "about": "string",
            "projects": [{"projectName": "string", "projectDescription": "string", "projectLink": "string"}],
            "workHistory": [{"title": "string", "company": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "currentlyWorkingThere": "boolean", "jobDescription": "string"}],
            "certificates": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM-DD"}],
            "education": [{"degree": "string", "institution": "string", "graduationYear": "YYYY"}]
          }

          output only the json data,not extra spaces, no extra characters, and not markdown format

          THE CV TEXT IS:

          ${cvContent}
          `,
          },
        ],
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("Empty response from OpenAI");
      }

      console.log("OpenAI API response:", response);

      try {
        const parsedData = JSON.parse(response);
        // Validate the structure of parsed data
        validateParsedData(parsedData);
        return parsedData;
      } catch (error) {
        throw new Error(`Invalid JSON response: ${error.message}`);
      }
    } catch (error) {
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * attempt)
        );
        return parseWithRetry(attempt + 1);
      }
      throw error;
    }
  }
  return parseWithRetry();
}

function isRetryableError(error: any): boolean {
  // Define which errors should trigger a retry
  const retryableErrors = [
    "rate_limit_exceeded",
    "timeout",
    "service_unavailable",
    "internal_server_error",
  ];

  return retryableErrors.some((errType) =>
    error.message?.toLowerCase().includes(errType)
  );
}

function validateParsedData(data: any) {
  const requiredFields = [
    "about",
    "projects",
    "workHistory",
    "certificates",
    "education",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate arrays
  if (!Array.isArray(data.projects))
    throw new Error("Projects must be an array");
  if (!Array.isArray(data.workHistory))
    throw new Error("Work history must be an array");
  if (!Array.isArray(data.certificates))
    throw new Error("Certificates must be an array");
  if (!Array.isArray(data.education))
    throw new Error("Education must be an array");
}

async function parseFile(file: File): Promise<string> {
  // Check if the file type is valid (Word or PDF)
  const fileType = file.type;
  if (
    fileType !== "application/pdf" &&
    fileType !==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    throw new Error(
      "Invalid file type. Only PDF and Word documents are accepted."
    );
  }

  // Convert File to Buffer
  const fileBuffer = await file.arrayBuffer();
  const fileName = file.name;

  // Pass the file to the respective parsing function
  if (fileType === "application/pdf") {
    return await extractTextFromPDF(fileBuffer, fileName);
  } else if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractTextFromWord(fileBuffer);
  }

  throw new Error("Unsupported file type.");
}

async function extractTextFromPDF(
  fileBuffer: ArrayBuffer,
  fileName: string
): Promise<string> {
  // Convert extract to a promise-based function
  let tempFilePath: string;
  try {
    // Step 1: Write the File object to a temporary location
    const tempDir = path.join(process.cwd(), "temp/uploads"); // Temporary folder
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    // generate a short random name for the file
    const randomName = Math.random().toString(36).substring(2, 15);
    tempFilePath = path.join(tempDir, `${randomName}${fileName}`);
    // const buffer = Buffer.from(await fileBuffer);
    // Write the file to disk
    // await fs.promises.writeFile(tempFilePath, fileBuffer);
    const pdfData = await Pdf.getPDFText(fileBuffer); //dataBuffer);
    return pdfData;
  } catch (error) {
    // delete the file
    await fs.promises.unlink(tempFilePath);
    throw new Error(`Error processing PDF: ${error}`);
  }
}

// Function to extract text from Word documents
async function extractTextFromWord(fileBuffer: ArrayBuffer): Promise<string> {
  const buffer = Buffer.from(fileBuffer);
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim(); // Extracted text from the Word file
}
