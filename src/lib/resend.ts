import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** @deprecated use getResend() */
export const resend = {
  get emails() {
    return getResend().emails;
  },
};

export const FROM_EMAIL = "Poolemark <noreply@poolemark.com>";
export const ADMIN_EMAIL = "info@poolemark.com";
