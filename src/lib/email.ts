import { resend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/resend";
import { WelcomeEmail } from "@/components/emails/welcome";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation";
import { ShippedEmail } from "@/components/emails/shipped";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";

export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Poolemark'a Hoş Geldiniz! 🎉",
      react: WelcomeEmail({ firstName }),
    });
  } catch (error) {
    console.error("Welcome email error:", error);
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  data: {
    firstName: string;
    orderNumber: string;
    orderId: string;
    items: { name: string; quantity: number; price: number; image?: string }[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
  }
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Siparişiniz Alındı — ${data.orderNumber}`,
      react: OrderConfirmationEmail({
        ...data,
        items: data.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
      }),
    });
  } catch (error) {
    console.error("Order confirmation email error:", error);
  }
}

export async function sendShippedEmail(
  email: string,
  data: {
    firstName: string;
    orderNumber: string;
    orderId: string;
    cargoCompany: string;
    trackingNumber: string;
    trackingUrl?: string;
  }
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Siparişiniz Kargoda — ${data.orderNumber}`,
      react: ShippedEmail(data),
    });
  } catch (error) {
    console.error("Shipped email error:", error);
  }
}

export async function sendContactNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Yeni İletişim: ${data.subject}`,
      react: ContactNotificationEmail(data),
    });
  } catch (error) {
    console.error("Contact notification email error:", error);
  }
}
