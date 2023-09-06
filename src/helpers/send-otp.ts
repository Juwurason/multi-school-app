import mailchimpClient from "@mailchimp/mailchimp_transactional";

// Initialize the Mailchimp Transactional Email client with your API key
const mailchimpApiKey = "1deee5c3b81a237486c41f56439505a4-us13";
const mailchimp = mailchimpClient(mailchimpApiKey);

// Function to send OTP email
export const sendOtpEmail = async (recipientEmail: string, otp: string): Promise<void> => {
  try {
    const response = await mailchimp.messages.sendTemplate({
      template_name: "Otp verification", // Replace with the name of your email template
      template_content: [
        {
          name: "otp", // Replace with the merge tag name in your email template
          content: otp, // Replace with the OTP code
        },
      ],
      message: {
        to: [{ email: recipientEmail }], // Recipient's email address
      },
    });
    console.log(response);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

// Example usage:
// const recipientEmail = "recipient@example.com"; // Replace with the recipient's email address
// const otp = "123456"; // Replace with the OTP code you want to send
// sendOtpEmail(recipientEmail, otp);
