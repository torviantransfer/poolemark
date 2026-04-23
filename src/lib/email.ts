import { resend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/resend";
import { WelcomeEmail } from "@/components/emails/welcome";
import { NewsletterWelcomeEmail } from "@/components/emails/newsletter-welcome";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation";
import { ShippedEmail } from "@/components/emails/shipped";
import { ReturnUpdateEmail } from "@/components/emails/return-update";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";
import { createAdminClient } from "@/lib/supabase/admin";

type NotificationPreferenceKey = "order" | "marketing" | "stock";

const DEFAULT_NOTIFICATION_PREFERENCES: Record<NotificationPreferenceKey, boolean> = {
  order: true,
  marketing: true,
  stock: true,
};

async function canSendByPreference(
  email: string,
  key: NotificationPreferenceKey
) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("notification_preferences")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) {
      return true;
    }

    const preferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(data.notification_preferences || {}),
    } as Record<NotificationPreferenceKey, boolean>;

    return preferences[key] !== false;
  } catch {
    return true;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const allowed = await canSendByPreference(email, "marketing");
  if (!allowed) return;

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

export async function sendNewsletterWelcomeEmail(
  email: string,
  data: {
    couponCode: string;
  }
) {
  const allowed = await canSendByPreference(email, "marketing");
  if (!allowed) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Bültene hoş geldiniz - ${data.couponCode}`,
      react: NewsletterWelcomeEmail({ couponCode: data.couponCode }),
    });
  } catch (error) {
    console.error("Newsletter welcome email error:", error);
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
  const allowed = await canSendByPreference(email, "order");
  if (!allowed) return;

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
  const allowed = await canSendByPreference(email, "order");
  if (!allowed) return;

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

export async function sendReturnRequestedEmail(
  email: string,
  data: {
    firstName: string;
    orderNumber: string;
  }
) {
  const allowed = await canSendByPreference(email, "order");
  if (!allowed) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `İade talebiniz alındı — ${data.orderNumber}`,
      react: ReturnUpdateEmail({
        firstName: data.firstName,
        orderNumber: data.orderNumber,
        title: "İade Talebiniz Alındı",
        message:
          "İade talebinizi aldık. Ekibimiz talebinizi inceledikten sonra süreçle ilgili sizi bilgilendirecek.",
      }),
    });
  } catch (error) {
    console.error("Return requested email error:", error);
  }
}

export async function sendReturnLabelEmail(
  email: string,
  data: {
    firstName: string;
    orderNumber: string;
    returnShippingCompany?: string;
    returnBarcode?: string;
  }
) {
  const allowed = await canSendByPreference(email, "order");
  if (!allowed) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `İade kargo bilgileriniz hazır — ${data.orderNumber}`,
      react: ReturnUpdateEmail({
        firstName: data.firstName,
        orderNumber: data.orderNumber,
        title: "İade Kargo Bilgileriniz Hazır",
        message:
          "İade kargo bilgilerinizi aşağıda paylaştık. Ürünü belirtilen kargo firması ve barkod kodu ile gönderebilirsiniz.",
        returnShippingCompany: data.returnShippingCompany,
        returnBarcode: data.returnBarcode,
      }),
    });
  } catch (error) {
    console.error("Return label email error:", error);
  }
}
