import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.BREVO_API_KEY) {
  console.warn("⚠️ Brevo API key not configured.");
}

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * sendEmailService
 * Same signature as your nodemailer version.
 */
export const sendEmailService = async ({
  to,
  subject,
  text,
  html,
  company,
  attachments = [], // optional
}) => {
  try {
    const emailData = {
      sender: {
        name: company || "WageDesk",
       email: "wagedesk@gmail.com",
      },
      to: Array.isArray(to)
        ? to.map((email) => ({ email }))
        : [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      attachments: attachments.map((file) => ({
        name: file.name,
        content:
          file.content instanceof Buffer
            ? file.content.toString("base64")
            : file.content, // already base64
      })),
    };

    const response = await apiInstance.sendTransacEmail(emailData);

    return response;
  } catch (error) {
    console.error(
      "Brevo send error:",
      error.response?.body || error.message
    );
    throw new Error("Failed to send email");
  }
};
