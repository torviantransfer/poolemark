import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Shield,
  Cookie,
  Scroll,
  RotateCcw,
  Truck,
  Scale,
  CreditCard,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";
import type { Metadata } from "next";

const PAGE_META: Record<
  string,
  {
    icon: typeof FileText;
    color: string;
    bgGradient: string;
    accent: string;
    accentBorder: string;
    description: string;
  }
> = {
  "kvkk-aydinlatma-metni": {
    icon: Shield,
    color: "text-indigo-600",
    bgGradient: "from-indigo-50 via-indigo-50/50 to-white",
    accent: "bg-indigo-50",
    accentBorder: "border-indigo-200",
    description:
      "6698 sayılı KVKK kapsamında kişisel verilerinizin korunmasına ilişkin bilgilendirme.",
  },
  "gizlilik-politikasi": {
    icon: Shield,
    color: "text-teal-600",
    bgGradient: "from-teal-50 via-teal-50/50 to-white",
    accent: "bg-teal-50",
    accentBorder: "border-teal-200",
    description:
      "Kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu öğrenin.",
  },
  "cerez-politikasi": {
    icon: Cookie,
    color: "text-amber-600",
    bgGradient: "from-amber-50 via-amber-50/50 to-white",
    accent: "bg-amber-50",
    accentBorder: "border-amber-200",
    description:
      "Web sitemizde kullanılan çerezler ve yönetim seçenekleri hakkında bilgi.",
  },
  "mesafeli-satis-sozlesmesi": {
    icon: Scroll,
    color: "text-orange-600",
    bgGradient: "from-orange-50 via-orange-50/50 to-white",
    accent: "bg-orange-50",
    accentBorder: "border-orange-200",
    description:
      "6502 sayılı kanun gereği tarafların hak ve yükümlülüklerini belirleyen sözleşme.",
  },
  "iade-degisim": {
    icon: RotateCcw,
    color: "text-rose-600",
    bgGradient: "from-rose-50 via-rose-50/50 to-white",
    accent: "bg-rose-50",
    accentBorder: "border-rose-200",
    description:
      "14 gün içinde koşulsuz iade hakkınız ve değişim süreçleri hakkında bilgi.",
  },
  "kargo-teslimat": {
    icon: Truck,
    color: "text-cyan-600",
    bgGradient: "from-cyan-50 via-cyan-50/50 to-white",
    accent: "bg-cyan-50",
    accentBorder: "border-cyan-200",
    description:
      "Kargo ücretleri, teslimat süreleri ve anlaşmalı kargo firmalarımız.",
  },
  "uyelik-sozlesmesi": {
    icon: BookOpen,
    color: "text-violet-600",
    bgGradient: "from-violet-50 via-violet-50/50 to-white",
    accent: "bg-violet-50",
    accentBorder: "border-violet-200",
    description: "Poolemark üyelik koşulları ve hakları.",
  },
  "kullanim-kosullari": {
    icon: Scale,
    color: "text-slate-600",
    bgGradient: "from-slate-50 via-slate-50/50 to-white",
    accent: "bg-slate-50",
    accentBorder: "border-slate-200",
    description: "Web sitemizi kullanım koşulları ve kuralları.",
  },
  sss: {
    icon: HelpCircle,
    color: "text-emerald-600",
    bgGradient: "from-emerald-50 via-emerald-50/50 to-white",
    accent: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    description: "Alışveriş, kargo, iade ve ödeme hakkında merak ettikleriniz.",
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("title, meta_description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!page) return { title: "Sayfa Bulunamadı" };

  return {
    title: `${page.title} | Poolemark`,
    description: page.meta_description || undefined,
    alternates: { canonical: `https://poolemark.com/pages/${slug}` },
  };
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!page) notFound();

  // Fetch other active pages for sidebar
  const { data: allPages } = await supabase
    .from("pages")
    .select("title, slug")
    .eq("is_active", true)
    .neq("slug", slug)
    .order("title");

  const meta = PAGE_META[slug] || {
    icon: FileText,
    color: "text-teal-600",
    bgGradient: "from-teal-50 via-teal-50/50 to-white",
    accent: "bg-teal-50",
    accentBorder: "border-teal-200",
    description: "",
  };
  const Icon = meta.icon;

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className={`bg-gradient-to-b ${meta.bgGradient} border-b border-border/30`}>
        <div className="container mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">
                Anasayfa
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{page.title}</span>
            </nav>

            <div className="flex items-start gap-6">
              <div
                className={`hidden md:flex items-center justify-center w-16 h-16 rounded-2xl ${meta.accent} border ${meta.accentBorder} shrink-0`}
              >
                <Icon className={`h-8 w-8 ${meta.color}`} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {page.title}
                </h1>
                {meta.description && (
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
                    {meta.description}
                  </p>
                )}
                {page.updated_at && (
                  <div className="flex items-center gap-2 mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${meta.accent} ${meta.color} border ${meta.accentBorder}`}>
                      Son güncelleme:{" "}
                      {new Date(page.updated_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-14">
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className="policy-content
                  prose prose-gray max-w-none
                  prose-headings:text-foreground prose-headings:font-bold
                  prose-h2:text-xl prose-h2:mt-0 prose-h2:mb-4 prose-h2:pb-0 prose-h2:border-0
                  prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-semibold
                  prose-h4:text-sm prose-h4:mt-4 prose-h4:mb-2 prose-h4:font-semibold prose-h4:uppercase prose-h4:tracking-wide prose-h4:text-muted-foreground
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-[15px]
                  prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:text-[15px]
                  prose-ul:my-3 prose-ol:my-3
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-em:text-muted-foreground/80
                "
                dangerouslySetInnerHTML={{ __html: page.content || "" }}
              />
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Quick Nav */}
                <div className="rounded-2xl border border-border/40 bg-secondary/30 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Diğer Sayfalar
                  </h3>
                  <div className="space-y-1">
                    {allPages?.map((p) => {
                      const LinkIcon = PAGE_META[p.slug]?.icon || FileText;
                      return (
                        <Link
                          key={p.slug}
                          href={`/pages/${p.slug}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white transition-all group"
                        >
                          <LinkIcon className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
                          <span className="truncate">{p.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Box */}
                <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-primary/5 to-transparent p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Yardıma mı ihtiyacınız var?
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Sorularınız için müşteri hizmetlerimize ulaşabilirsiniz.
                  </p>
                  <div className="space-y-2.5">
                    <a
                      href="tel:08508401327"
                      className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="h-4 w-4 text-primary" />
                      0 850 840 13 27
                    </a>
                    <a
                      href="mailto:info@poolemark.com"
                      className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4 text-primary" />
                      info@poolemark.com
                    </a>
                  </div>
                  <Link
                    href="/iletisim"
                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    İletişime Geçin
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}


