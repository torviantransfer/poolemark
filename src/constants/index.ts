export const SITE_CONFIG = {
  name: "Poolemark",
  description: "Ev Gereçleri & Dekorasyon",
  url: "https://poolemark.com",
  ogImage: "https://poolemark.com/og.jpg",
  locale: "tr_TR",
  currency: "TRY",
  currencySymbol: "₺",
  phone: "0 850 840 13 27",
  phoneRaw: "08508401327",
  email: "info@poolemark.com",
  address: "Sedir Mahallesi, NO:18, Muratpaşa / Antalya",
  city: "Antalya",
  district: "Muratpaşa",
  taxOffice: "Düden Vergi Dairesi",
  taxNumber: "2340586838",
  companyName: "Poolemark Ltd. Şti.",
  legalName: "Poolemark Limited Şirketi",
  foundedYear: 2018,
  whatsapp: "908508401327",
  workingHours: "Pazartesi - Cumartesi, 09:00 - 18:00",
  socialMedia: {
    instagram: "https://www.instagram.com/poolemark",
    facebook: "https://www.facebook.com/poolemark",
    twitter: "https://x.com/poolemark",
  },
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoya Verildi",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  returned: "İade Edildi",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade Edildi",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const NAV_LINKS = [
  { label: "Anasayfa", href: "/" },
  { label: "Ürünler", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
] as const;

export const ACCOUNT_NAV_LINKS = [
  { label: "Hesabım", href: "/hesabim", icon: "LayoutDashboard" },
  { label: "Siparişlerim", href: "/hesabim/siparislerim", icon: "Package" },
  { label: "Adreslerim", href: "/hesabim/adreslerim", icon: "MapPin" },
  { label: "Favorilerim", href: "/hesabim/favorilerim", icon: "Heart" },
  { label: "Bilgilerim", href: "/hesabim/bilgilerim", icon: "User" },
  { label: "Bildirimler", href: "/hesabim/bildirimler", icon: "Bell" },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  {
    label: "Ürünler",
    href: "/admin/urunler",
    icon: "Package",
    children: [
      { label: "Ürün Listesi", href: "/admin/urunler" },
      { label: "Ürün Ekle", href: "/admin/urunler/ekle" },
    ],
  },
  { label: "Kategoriler", href: "/admin/kategoriler", icon: "FolderTree" },
  { label: "Siparişler", href: "/admin/siparisler", icon: "ShoppingCart" },
  { label: "Müşteriler", href: "/admin/musteriler", icon: "Users" },
  { label: "Kuponlar", href: "/admin/kuponlar", icon: "Ticket" },
  { label: "Kargo Firmaları", href: "/admin/kargolar", icon: "Truck" },
  { label: "İade Talepleri", href: "/admin/iadeler", icon: "RotateCcw" },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: "FileText",
    children: [
      { label: "Yazılar", href: "/admin/blog" },
      { label: "Yeni Yazı", href: "/admin/blog/ekle" },
    ],
  },
  { label: "Sayfalar", href: "/admin/sayfalar", icon: "File" },
  { label: "Bannerlar", href: "/admin/bannerlar", icon: "Image" },
  { label: "Duyurular", href: "/admin/duyurular", icon: "Megaphone" },
  { label: "Mesajlar", href: "/admin/mesajlar", icon: "MessageSquare" },
  { label: "Yorumlar", href: "/admin/yorumlar", icon: "Star" },
  { label: "Canlı Ziyaretçi", href: "/admin/canli-ziyaretciler", icon: "Activity" },
  { label: "Raporlar", href: "/admin/raporlar", icon: "BarChart3" },
  { label: "Ayarlar", href: "/admin/ayarlar", icon: "Settings" },
] as const;

export const ITEMS_PER_PAGE = 12;
export const ADMIN_ITEMS_PER_PAGE = 20;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const TURKISH_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya",
  "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir",
  "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis",
  "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
  "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş",
  "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis",
  "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya",
  "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya",
  "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van",
  "Yalova", "Yozgat", "Zonguldak",
] as const;
