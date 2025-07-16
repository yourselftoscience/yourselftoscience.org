import staticFormsPlugin from "@cloudflare/pages-plugin-static-forms";
import { Resend } from "resend";

// This is a Pages Function that will intercept all form submissions
export const onRequest: PagesFunction = staticFormsPlugin({
  // The respondWith function is called when a form is submitted
  respondWith: async ({ formData, name }) => {
    // Get the form data
    const data = Object.fromEntries(formData);

    // Get the Resend API key from the environment variables
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      // Send the email
      await resend.emails.send({
        from: "Yourself To Science <hello@yourselftoscience.org>",
        to: ["hello@yourselftoscience.org"],
        subject: `New Contact Form Submission: ${data.subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f7f7f7; padding: 20px;">
              <h2 style="margin: 0; color: #333;">New Submission: ${name} Form</h2>
            </div>
            <div style="padding: 20px;">
              <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
              <p><strong>Inquiry Type:</strong> ${data.subject}</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #fafafa; border-radius: 4px; border: 1px solid #eee;">
                <p style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${data.message}</p>
              </div>
            </div>
            <div style="background-color: #f7f7f7; padding: 10px; text-align: center; font-size: 12px; color: #888;">
              <p>This message was sent from the contact form on yourselftoscience.org.</p>
            </div>
          </div>
        `,
      });
      
      // Redirect to a success page
      const url = new URL("/get-involved?submitted=true#contact-us", "https://yourselftoscience.org");
      return Response.redirect(url.toString(), 302);

    } catch (error) {
      console.error("Error sending email:", error);
      
      // Redirect to an error page
      const url = new URL("/get-involved?error=true#contact-us", "https://yourselftoscience.org");
      return Response.redirect(url.toString(), 302);
    }
  },
}); 