import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const DEFAULT_FROM = "PitchIQ <noreply@pitchiq.com>";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] No RESEND_API_KEY configured — skipping email");
    return false;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (err) {
    console.error("[email] Send failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
