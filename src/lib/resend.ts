import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "Poolemark <noreply@poolemark.com>";
export const ADMIN_EMAIL = "info@poolemark.com";
