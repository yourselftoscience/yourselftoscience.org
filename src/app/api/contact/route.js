import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const honeypot = data.honeypot;

  // Honeypot check for bots
  if (honeypot) {
    return new Response(null, { status: 200 }); // Fail silently
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Yourself To Science <hello@yourselftoscience.org>",
      to: ["hello@yourselftoscience.org"],
      subject: `New Contact Form Submission: ${data.subject}`,
      reply_to: `${data.name} <${data.email}>`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f7f7f7; padding: 20px;">
            <h2 style="margin: 0; color: #333;">New Contact Form Submission</h2>
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

    const successUrl = new URL(request.url);
    successUrl.pathname = '/get-involved';
    successUrl.searchParams.set('submitted', 'true');
    successUrl.hash = 'contact-us';
    return NextResponse.redirect(successUrl.toString(), 302);

  } catch (error) {
    console.error("Error sending email:", error);
    const errorUrl = new URL(request.url);
    errorUrl.pathname = '/get-involved';
    errorUrl.searchParams.set('error', 'true');
    errorUrl.hash = 'contact-us';
    return NextResponse.redirect(errorUrl.toString(), 302);
  }
} 