-- Update all pages with corrected business information
-- Kargo: 1-2 iş günü, MNG/Yurtiçi/Sürat/Aras/Kolay Gelsin
-- İade: Ücretsiz, firma karşılıyor, WhatsApp/panel/e-posta ile talep
-- Taksit: 3, 6, 9, 12 ay
-- Hafta içi 14:00 öncesi aynı gün kargo, sonrası ertesi gün
-- Cumartesi 11:00 öncesi aynı gün, sonrası ilk iş günü
-- 500₺ üzeri ücretsiz kargo

-- Kargo ve Teslimat
UPDATE public.pages SET content = '
<h2>Kargo ve Teslimat Bilgileri</h2>

<h3>Kargo Ücreti</h3>
<ul>
<li><strong>500₺ ve üzeri</strong> tüm siparişlerde kargo ücreti <strong>tarafımızca karşılanır</strong></li>
<li>500₺ altı siparişlerde kargo ücreti sepet sayfasında belirtilir</li>
</ul>

<h3>Kargoya Verme Süreleri</h3>
<ul>
<li><strong>Hafta içi 14:00''a kadar</strong> verilen tüm siparişler <strong>aynı gün</strong> kargoya verilir</li>
<li>Hafta içi 14:00 sonrası verilen siparişler <strong>bir sonraki iş günü</strong> kargoya verilir</li>
<li><strong>Cumartesi 11:00''e kadar</strong> verilen siparişler <strong>aynı gün</strong> kargoya verilir</li>
<li>Cumartesi 11:00 sonrası ve Pazar günü verilen siparişler <strong>ilk iş günü</strong> kargoya verilir</li>
</ul>

<h3>Teslimat Süresi</h3>
<ul>
<li>Siparişiniz kargoya verildikten sonra <strong>1-2 iş günü</strong> içinde adresinize teslim edilir</li>
<li>Toplam teslimat süresi bulunduğunuz bölgeye göre değişkenlik gösterebilir</li>
</ul>

<h3>Kargo Takibi</h3>
<p>Siparişiniz kargoya verildiğinde kargo takip numarası e-posta ile gönderilir. Hesabınızdaki <strong>Siparişlerim</strong> bölümünden de kargo durumunu anlık olarak takip edebilirsiniz.</p>

<h3>Teslimat Alanı</h3>
<p>Türkiye''nin <strong>81 iline</strong> teslimat yapılmaktadır.</p>

<h3>Teslimat Sırasında Dikkat Edilecekler</h3>
<ul>
<li>Kargo paketini teslim alırken mutlaka kontrol edin</li>
<li>Hasar veya ezilme varsa kargo görevlisine tutanak tutturun</li>
<li>Hasarlı ürünü teslim almak zorunda değilsiniz</li>
<li>Teslimat sırasında sorun yaşarsanız <strong>0 850 840 13 27</strong> numarasından bize ulaşın</li>
</ul>

<h3>Anlaşmalı Kargo Firmaları</h3>
<ul>
<li><strong>MNG Kargo</strong></li>
<li><strong>Yurtiçi Kargo</strong></li>
<li><strong>Sürat Kargo</strong></li>
<li><strong>Aras Kargo</strong></li>
<li><strong>Kolay Gelsin</strong></li>
</ul>
<p>Bölgenize göre en uygun kargo firması otomatik olarak seçilir.</p>

<h3>İletişim</h3>
<p>Kargo ve teslimat konusundaki sorularınız için:<br>
E-posta: <strong>info@poolemark.com</strong><br>
Telefon: <strong>0 850 840 13 27</strong><br>
WhatsApp: <strong>0 850 840 13 27</strong></p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'kargo-ve-teslimat';


-- İade ve Değişim Politikası
UPDATE public.pages SET content = '
<h2>İade ve Değişim Politikası</h2>
<p><strong>Poolemark</strong> olarak müşteri memnuniyetini ön planda tutuyoruz. Tüm iade işlemlerinde kargo ücreti tarafımızca karşılanmaktadır.</p>

<h3>Cayma Hakkı</h3>
<p>6502 sayılı Tüketicinin Korunması Hakkında Kanun gereği, ürünü teslim aldığınız tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz.</p>

<h3>İade Koşulları</h3>
<ul>
<li>Ürün <strong>kullanılmamış</strong> ve <strong>orijinalliği bozulmamış</strong> olmalıdır</li>
<li>Ürün orijinal ambalajında, etiketi ve aksesuarları eksiksiz olmalıdır</li>
<li>Fatura veya e-fatura ibraz edilmelidir</li>
<li>Kullanılmış, hasar verilmiş veya orijinalliği bozulmuş ürünlerde iade kabul edilmez</li>
<li>Birden fazla ürün sipariş ettiyseniz, yalnızca kullanılmamış ve orijinalliği bozulmamış ürünler için iade talebi oluşturabilirsiniz</li>
</ul>

<h3>Ücretsiz İade</h3>
<p>Tüm iade işlemlerinde kargo ücreti <strong>Poolemark tarafından karşılanır</strong>. İade talebiniz onaylandığında tarafınıza bir <strong>iade kargo kodu</strong> iletilir. Bu kod ile anlaşmalı kargo firmalarından (MNG Kargo, Yurtiçi Kargo, Sürat Kargo, Aras Kargo, Kolay Gelsin) ücretsiz olarak kargonuzu gönderebilirsiniz.</p>

<h3>İade Talebi Nasıl Oluşturulur?</h3>
<p>İade talebinizi aşağıdaki kanallardan oluşturabilirsiniz:</p>
<ol>
<li><strong>Müşteri Paneli:</strong> Hesabınızdaki "Siparişlerim" bölümünden ilgili siparişi seçerek iade talebi oluşturabilirsiniz</li>
<li><strong>WhatsApp:</strong> <strong>0 850 840 13 27</strong> numarasına mesaj göndererek iade talebinizi iletebilirsiniz</li>
<li><strong>E-posta:</strong> <strong>info@poolemark.com</strong> adresine sipariş numaranızı ve iade nedeninizi belirterek başvurabilirsiniz</li>
</ol>

<h3>İade Süreci</h3>
<ol>
<li>Yukarıdaki kanallardan iade talebinizi oluşturun</li>
<li>Talebiniz onaylandıktan sonra tarafınıza <strong>ücretsiz iade kargo kodu</strong> gönderilir</li>
<li>Ürünü orijinal ambalajında paketleyerek anlaşmalı kargo firmasına teslim edin</li>
<li>Ürün tarafımıza ulaşıp kontrol edildikten sonra iade işlemi başlatılır</li>
<li>İade tutarı, ödeme yönteminize göre <strong>5-10 iş günü</strong> içinde hesabınıza yansır</li>
</ol>

<h3>Hasarlı / Hatalı Ürün</h3>
<p>Ürün hasarlı veya hatalı ulaştıysa lütfen teslimat tarihinden itibaren <strong>3 gün</strong> içinde bizimle iletişime geçin. Fotoğraf ile durumu belgeleyin. Hasarlı ürünlerde değişim veya iade işlemi öncelikli olarak gerçekleştirilir.</p>

<h3>İade Kabul Edilmeyen Durumlar</h3>
<ul>
<li>Kullanılmış veya denenmiş ürünler</li>
<li>Orijinal ambalajı açılmış ve iade edilemeyecek nitelikteki ürünler</li>
<li>Tüketicinin istekleri doğrultusunda özelleştirilmiş ürünler</li>
<li>Orijinalliği bozulmuş, hasar verilmiş veya eksik parçalı ürünler</li>
</ul>

<h3>Değişim</h3>
<p>Ürün değişimi için aynı iade prosedürü uygulanır. Yeni ürün, iade edilen ürünün tarafımıza ulaşmasının ardından gönderilir.</p>

<h3>İletişim</h3>
<p>İade ve değişim konusundaki tüm sorularınız için:<br>
E-posta: <strong>info@poolemark.com</strong><br>
Telefon: <strong>0 850 840 13 27</strong><br>
WhatsApp: <strong>0 850 840 13 27</strong></p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'iade-ve-degisim';


-- Mesafeli Satış Sözleşmesi
UPDATE public.pages SET content = '
<h2>Mesafeli Satış Sözleşmesi</h2>

<h3>1. Taraflar</h3>
<p><strong>SATICI:</strong><br>
Unvan: Poolemark<br>
Adres: Sedir Mahallesi, NO:18, Muratpaşa / Antalya<br>
Telefon: 0 850 840 13 27<br>
E-posta: info@poolemark.com<br>
Vergi Dairesi / No: Düden Vergi Dairesi / 2340586838</p>

<p><strong>ALICI:</strong><br>
Sipariş sırasında belirtilen ad, soyad, adres ve iletişim bilgileridir.</p>

<h3>2. Sözleşmenin Konusu</h3>
<p>İşbu sözleşmenin konusu, Alıcı''nın Satıcı''ya ait poolemark.com internet sitesinden elektronik ortamda siparişini verdiği ürün/ürünlerin satışı ve teslimatına ilişkin 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>

<h3>3. Sözleşme Konusu Ürün Bilgileri</h3>
<p>Ürünün türü, miktarı, marka/modeli, rengi, adedi, satış fiyatı, ödeme şekli ve teslimat bilgileri sipariş onay e-postasında ve faturada belirtilmiştir.</p>

<h3>4. Genel Hükümler</h3>
<ul>
<li>Alıcı, sipariş verdiği ürün/ürünlerin temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimat bilgilerini okuyup bilgi sahibi olduğunu kabul eder</li>
<li>Sipariş edilen ürünler, stok durumuna göre en geç 30 iş günü içerisinde teslim edilir</li>
<li>Ürünler Alıcı''nın belirttiği teslimat adresine kargo ile gönderilir</li>
<li>500₺ ve üzeri siparişlerde kargo ücreti Satıcı tarafından karşılanır</li>
</ul>

<h3>5. Teslimat Koşulları</h3>
<ul>
<li>Hafta içi saat 14:00''a kadar verilen siparişler aynı gün kargoya verilir</li>
<li>Hafta içi saat 14:00 sonrası verilen siparişler bir sonraki iş günü kargoya verilir</li>
<li>Cumartesi saat 11:00''e kadar verilen siparişler aynı gün kargoya verilir</li>
<li>Cumartesi saat 11:00 sonrası ve Pazar günü verilen siparişler ilk iş günü kargoya verilir</li>
<li>Kargoya verilen ürünler 1-2 iş günü içinde teslim edilir</li>
<li>Anlaşmalı kargo firmaları: MNG Kargo, Yurtiçi Kargo, Sürat Kargo, Aras Kargo, Kolay Gelsin</li>
</ul>

<h3>6. Ödeme Bilgileri</h3>
<ul>
<li>Kredi kartı (Visa, Mastercard, Troy), banka kartı ve havale/EFT ile ödeme yapılabilir</li>
<li>Kredi kartına <strong>3, 6, 9 ve 12 taksit</strong> seçenekleri mevcuttur</li>
<li>Tüm ödeme işlemleri 256-bit SSL şifreleme ve 3D Secure ile korunmaktadır</li>
<li>Kredi kartı bilgileri sunucularımızda kesinlikle saklanmaz</li>
</ul>

<h3>7. Cayma Hakkı</h3>
<p>Alıcı, ürünü teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.</p>
<ul>
<li>İade edilecek ürünün kullanılmamış ve orijinalliğinin bozulmamış olması gerekmektedir</li>
<li>Tüm iade işlemlerinde kargo ücreti Satıcı tarafından karşılanır</li>
<li>İade talebi müşteri paneli, WhatsApp (0 850 840 13 27) veya e-posta (info@poolemark.com) üzerinden oluşturulabilir</li>
<li>Onaylanan iade talepleri için ücretsiz iade kargo kodu gönderilir</li>
</ul>

<h3>8. Cayma Hakkının Kullanılamayacağı Durumlar</h3>
<ul>
<li>Kullanılmış veya orijinalliği bozulmuş ürünler</li>
<li>Tüketicinin istekleri doğrultusunda özelleştirilen ürünler</li>
<li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
<li>Tesliminden sonra ambalajı açılmış ve iade edilemeyecek nitelikteki ürünler</li>
<li>Birden fazla ürün içeren siparişlerde kullanılmış ürünler iade edilemez; yalnızca kullanılmamış ve orijinalliği bozulmamış ürünler iade edilebilir</li>
</ul>

<h3>9. Uyuşmazlık Çözümü</h3>
<p>İşbu sözleşmeden doğan uyuşmazlıklarda Ticaret Bakanlığı tarafından ilan edilen değere kadar Tüketici Hakem Heyetleri, üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.</p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'mesafeli-satis-sozlesmesi';


-- Kullanım Koşulları
UPDATE public.pages SET content = '
<h2>Kullanım Koşulları</h2>

<h3>1. Genel</h3>
<p>poolemark.com web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen siteyi kullanmadan önce bu koşulları dikkatlice okuyunuz.</p>

<h3>2. Fikri Mülkiyet</h3>
<p>Bu web sitesindeki tüm içerik (metin, görsel, logo, tasarım) <strong>Poolemark</strong>''a aittir ve telif hakları ile korunmaktadır. İzinsiz kopyalanması, çoğaltılması veya dağıtılması yasaktır.</p>

<h3>3. Ürün Bilgileri</h3>
<ul>
<li>Ürün fiyatları ve stok durumu önceden haber verilmeksizin değişebilir</li>
<li>Ürün görselleri temsilidir, renk ve boyut farklılıkları olabilir</li>
<li>Teknik özellikler üretici tarafından değiştirilebilir</li>
</ul>

<h3>4. Sipariş ve Ödeme</h3>
<ul>
<li>Sitemizden üye olarak veya misafir olarak alışveriş yapabilirsiniz</li>
<li>Kredi kartı (Visa, Mastercard, Troy), banka kartı ve havale/EFT ile ödeme yapabilirsiniz</li>
<li>Kredi kartına <strong>3, 6, 9 ve 12 taksit</strong> seçenekleri sunulmaktadır</li>
<li>Tüm ödeme işlemleri 256-bit SSL şifreleme ve 3D Secure ile korunmaktadır</li>
<li>Poolemark, herhangi bir siparişi kabul etmeme hakkını saklı tutar</li>
</ul>

<h3>5. Teslimat</h3>
<ul>
<li>500₺ ve üzeri siparişlerde kargo ücretsizdir</li>
<li>Hafta içi 14:00''a kadar verilen siparişler aynı gün, sonrası ertesi iş günü kargoya verilir</li>
<li>Cumartesi 11:00''e kadar verilen siparişler aynı gün, sonrası ilk iş günü kargoya verilir</li>
<li>Kargoya verilen ürünler 1-2 iş günü içinde teslim edilir</li>
</ul>

<h3>6. İade ve Cayma Hakkı</h3>
<ul>
<li>Teslim tarihinden itibaren 14 gün içinde iade hakkınız mevcuttur</li>
<li>İade kargo ücreti Poolemark tarafından karşılanır</li>
<li>İade edilecek ürünün kullanılmamış ve orijinalliğinin bozulmamış olması gerekmektedir</li>
<li>İade talebi müşteri paneli, WhatsApp veya e-posta üzerinden oluşturulabilir</li>
</ul>

<h3>7. Sorumluluk Sınırlaması</h3>
<p>Poolemark, web sitesinin kesintisiz veya hatasız çalışacağını garanti etmez. Teknik arızalar, bakım çalışmaları veya mücbir sebepler nedeniyle oluşabilecek aksaklıklardan sorumlu tutulamaz.</p>

<h3>8. Değişiklikler</h3>
<p>Poolemark, işbu kullanım koşullarını önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar. Güncel koşullar her zaman bu sayfada yayınlanır.</p>

<h3>9. Uygulanacak Hukuk</h3>
<p>İşbu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Antalya Mahkemeleri ve İcra Daireleri yetkilidir.</p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'kullanim-kosullari';


-- KVKK Aydınlatma Metni
UPDATE public.pages SET content = '
<h2>Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</h2>
<p><strong>Poolemark</strong> olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. Bu doğrultuda 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında sizleri bilgilendirmek isteriz.</p>

<h3>Veri Sorumlusu</h3>
<p><strong>Poolemark</strong><br>
Sedir Mahallesi, NO:18, Muratpaşa / Antalya<br>
Düden Vergi Dairesi - VKN: 2340586838<br>
E-posta: info@poolemark.com | Telefon: 0 850 840 13 27</p>

<h3>Toplanan Kişisel Veriler</h3>
<ul>
<li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (fatura için gerektiğinde)</li>
<li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, teslimat ve fatura adresi</li>
<li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, sepet bilgileri, favori ürünler, iade talepleri</li>
<li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, çerez verileri, oturum bilgileri, cihaz ve tarayıcı bilgileri</li>
</ul>

<h3>Kişisel Verilerin İşlenme Amaçları</h3>
<ul>
<li>Üyelik işlemlerinin gerçekleştirilmesi ve hesap yönetimi</li>
<li>Sipariş, teslimat ve iade süreçlerinin yönetimi</li>
<li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi</li>
<li>Müşteri ilişkileri yönetimi ve destek hizmetleri</li>
<li>Fatura düzenleme ve muhasebe işlemleri</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Kampanya, indirim ve yeni ürün bilgilendirmeleri (onay verilmesi halinde)</li>
<li>Site kullanım analizleri ve hizmet kalitesinin artırılması</li>
</ul>

<h3>Kişisel Verilerin Aktarımı</h3>
<p>Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:</p>
<ul>
<li><strong>Kargo şirketleri:</strong> MNG Kargo, Yurtiçi Kargo, Sürat Kargo, Aras Kargo, Kolay Gelsin (teslimat ve iade kargo işlemleri için)</li>
<li><strong>Ödeme kuruluşları:</strong> Ödeme işlemlerinin gerçekleştirilmesi için (PCI DSS uyumlu altyapı)</li>
<li><strong>Yasal merciler:</strong> Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları ile</li>
</ul>

<h3>Veri Saklama Süresi</h3>
<p>Kişisel verileriniz, ilgili mevzuatta öngörülen süreler ve işleme amacının gerektirdiği süre boyunca saklanır. Yasal saklama süresi sona eren veriler, usulüne uygun şekilde silinir veya anonim hale getirilir.</p>

<h3>Haklarınız</h3>
<p>KVKK''nın 11. maddesi gereği aşağıdaki haklara sahipsiniz:</p>
<ul>
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
<li>İşlenmişse buna ilişkin bilgi talep etme</li>
<li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
<li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
<li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
<li>KVKK''nın 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme</li>
<li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
<li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğranması halinde zararın giderilmesini talep etme</li>
</ul>

<h3>Başvuru</h3>
<p>KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki kanallardan başvurabilirsiniz:</p>
<ul>
<li>E-posta: <strong>info@poolemark.com</strong></li>
<li>Posta adresi: Sedir Mahallesi, NO:18, Muratpaşa / Antalya</li>
</ul>
<p>Başvurularınız en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılır.</p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'kvkk';


-- Gizlilik Politikası
UPDATE public.pages SET content = '
<h2>Gizlilik Politikası</h2>
<p><strong>Poolemark</strong> olarak gizliliğinize saygı duyuyor ve kişisel bilgilerinizi korumayı taahhüt ediyoruz. Bu politika, web sitemizi kullanırken hangi bilgileri topladığımızı, nasıl kullandığımızı ve koruduğumuzu açıklamaktadır.</p>

<h3>Toplanan Bilgiler</h3>
<p>Web sitemizi ziyaret ettiğinizde veya alışveriş yaptığınızda aşağıdaki bilgiler toplanabilir:</p>
<ul>
<li>Ad, soyad ve iletişim bilgileri</li>
<li>Teslimat ve fatura adresi</li>
<li>E-posta adresi ve telefon numarası</li>
<li>Ödeme bilgileri (kredi kartı bilgileri tarafımızca saklanmaz, PCI DSS uyumlu ödeme kuruluşu tarafından işlenir)</li>
<li>IP adresi, tarayıcı türü, cihaz bilgileri</li>
<li>Alışveriş geçmişi, favori ürünler ve tercihler</li>
</ul>

<h3>Bilgilerin Kullanım Amacı</h3>
<ul>
<li>Siparişlerinizi işlemek ve teslimatı gerçekleştirmek</li>
<li>İade ve değişim süreçlerini yönetmek</li>
<li>Hesabınızı yönetmek ve güvenliğini sağlamak</li>
<li>Müşteri desteği sağlamak</li>
<li>Yasal yükümlülüklerimizi yerine getirmek (fatura, vergi beyanları vb.)</li>
<li>Onayınız dahilinde kampanya ve bilgilendirme göndermek</li>
<li>Site kullanım deneyimini geliştirmek</li>
</ul>

<h3>Bilgi Güvenliği</h3>
<p>Kişisel bilgileriniz <strong>256-bit SSL şifreleme</strong> ile korunmaktadır. Ödeme işlemleriniz PCI DSS uyumlu ödeme altyapısı üzerinden <strong>3D Secure</strong> teknolojisi ile güvenle gerçekleştirilir. Kredi kartı bilgileriniz sunucularımızda kesinlikle saklanmaz.</p>

<h3>Üçüncü Taraflarla Paylaşım</h3>
<p>Kişisel bilgileriniz yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşılır:</p>
<ul>
<li><strong>Kargo firmaları:</strong> MNG Kargo, Yurtiçi Kargo, Sürat Kargo, Aras Kargo, Kolay Gelsin (teslimat ve iade için)</li>
<li><strong>Ödeme kuruluşları:</strong> Ödeme işlemlerinin güvenle gerçekleştirilmesi için</li>
<li><strong>Yasal zorunluluk:</strong> Yetkili kamu kurum ve kuruluşlarının talebi halinde</li>
</ul>

<h3>Çerezler</h3>
<p>Web sitemiz, deneyiminizi geliştirmek amacıyla çerezler kullanmaktadır. Çerez kullanımı hakkında detaylı bilgi için <strong>Çerez Politikası</strong> sayfamızı inceleyebilirsiniz.</p>

<h3>Haklarınız</h3>
<p>KVKK kapsamında kişisel verilerinize ilişkin haklarınız mevcuttur. Detaylı bilgi için <strong>KVKK Aydınlatma Metni</strong> sayfamızı inceleyebilirsiniz.</p>

<h3>İletişim</h3>
<p>Gizlilik politikamız hakkında sorularınız için:<br>
E-posta: <strong>info@poolemark.com</strong><br>
Telefon: <strong>0 850 840 13 27</strong></p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'gizlilik-politikasi';


-- Çerez Politikası
UPDATE public.pages SET content = '
<h2>Çerez (Cookie) Politikası</h2>
<p><strong>Poolemark</strong> web sitesi, size daha iyi bir deneyim sunmak amacıyla çerezler kullanmaktadır.</p>

<h3>Çerez Nedir?</h3>
<p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, tercihlerinizi hatırlamamıza ve site deneyiminizi geliştirmemize yardımcı olur.</p>

<h3>Kullanılan Çerez Türleri</h3>

<h4>Zorunlu Çerezler</h4>
<p>Web sitesinin düzgün çalışması için gerekli olan çerezlerdir. Oturum yönetimi, sepet bilgileri, güvenlik ve kimlik doğrulama gibi temel işlevleri sağlar. Bu çerezler olmadan site düzgün çalışamaz.</p>

<h4>İşlevsellik Çerezleri</h4>
<p>Dil tercihi, bölge seçimi, son görüntülenen ürünler gibi tercihlerinizi hatırlamak için kullanılır. Bu sayede her ziyaretinizde ayarlarınızı yeniden yapmanıza gerek kalmaz.</p>

<h4>Analitik Çerezler</h4>
<p>Web sitemizin nasıl kullanıldığını anlamamıza yardımcı olur. Sayfa görüntüleme sayıları, ziyaretçi sayıları gibi anonim istatistiksel veriler toplar. Bu veriler site deneyimini iyileştirmek için kullanılır.</p>

<h4>Pazarlama Çerezleri</h4>
<p>İlgi alanlarınıza uygun reklam ve içerik sunmak amacıyla kullanılır. Bu çerezler onayınız dahilinde çalışır.</p>

<h3>Çerezleri Yönetme</h3>
<p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak bazı çerezlerin engellenmesi web sitesinin işlevselliğini etkileyebilir.</p>
<ul>
<li><strong>Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve site verileri</li>
<li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
<li><strong>Safari:</strong> Tercihler → Gizlilik → Web sitesi verilerini yönet</li>
<li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
</ul>

<h3>İletişim</h3>
<p>Çerez politikamız hakkında sorularınız için <strong>info@poolemark.com</strong> adresinden bize ulaşabilirsiniz.</p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'cerez-politikasi';


-- Üyelik Sözleşmesi
UPDATE public.pages SET content = '
<h2>Üyelik Sözleşmesi</h2>

<h3>1. Taraflar</h3>
<p>İşbu sözleşme, <strong>Poolemark</strong> (Sedir Mahallesi, NO:18, Muratpaşa / Antalya, Düden Vergi Dairesi, VKN: 2340586838) ile poolemark.com web sitesine üye olan kullanıcı arasında akdedilmiştir.</p>

<h3>2. Sözleşmenin Konusu</h3>
<p>İşbu sözleşmenin konusu, üyenin poolemark.com web sitesinden yararlanma koşulları ile tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>

<h3>3. Üyelik Koşulları</h3>
<ul>
<li>Üye olmak için 18 yaşını doldurmuş olmak gerekir</li>
<li>Üyelik için geçerli bir e-posta adresi gereklidir</li>
<li>Üye, kayıt sırasında verdiği bilgilerin doğruluğunu taahhüt eder</li>
<li>Hesap bilgilerinin güvenliği üyenin sorumluluğundadır</li>
<li>Aynı e-posta adresi ile birden fazla hesap oluşturulamaz</li>
</ul>

<h3>4. Üyelik Hakları</h3>
<ul>
<li>Alışveriş yapma ve sipariş takibi</li>
<li>Kredi kartına 3, 6, 9 ve 12 taksit ile ödeme</li>
<li>Adres defteri oluşturma ve yönetme</li>
<li>Favori ürün listesi oluşturma</li>
<li>Ürün değerlendirme ve yorum yapma</li>
<li>Kampanya ve indirimlerden yararlanma</li>
<li>Müşteri panelinden iade talebi oluşturma</li>
<li>Sipariş ve kargo takibi</li>
</ul>

<h3>5. Poolemark''ın Hakları</h3>
<ul>
<li>Hizmet koşullarını önceden bildirimde bulunarak değiştirme</li>
<li>Kurallara uymayan üyelikleri askıya alma veya sonlandırma</li>
<li>Ürün fiyatlarını ve kampanya koşullarını değiştirme</li>
<li>Stok durumuna göre sipariş iptali yapma</li>
</ul>

<h3>6. Gizlilik ve Kişisel Veriler</h3>
<p>Üyenin kişisel verileri, 6698 sayılı KVKK kapsamında işlenir ve korunur. Detaylı bilgi için KVKK Aydınlatma Metni ve Gizlilik Politikası sayfalarımızı inceleyebilirsiniz.</p>

<h3>7. Hesap Silme</h3>
<p>Üye, dilediği zaman <strong>info@poolemark.com</strong> adresine başvurarak hesabının silinmesini talep edebilir. KVKK kapsamında başvurular en geç <strong>30 gün</strong> içinde işleme alınır.</p>

<h3>8. Uyuşmazlık Çözümü</h3>
<p>İşbu sözleşmeden doğan uyuşmazlıklarda Antalya Mahkemeleri ve İcra Daireleri yetkilidir.</p>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'uyelik-sozlesmesi';


-- SSS (Sıkça Sorulan Sorular)
UPDATE public.pages SET content = '
<h2>Sipariş ve Alışveriş</h2>

<h3>Nasıl sipariş verebilirim?</h3>
<p>Beğendiğiniz ürünü sepetinize ekleyip, üye girişi yaptıktan sonra teslimat ve ödeme bilgilerinizi girerek siparişinizi tamamlayabilirsiniz. Misafir olarak da alışveriş yapabilirsiniz.</p>

<h3>Siparişimi verdikten sonra değişiklik yapabilir miyim?</h3>
<p>Siparişiniz kargoya verilmeden önce <strong>0 850 840 13 27</strong> numarasını arayarak, WhatsApp üzerinden mesaj göndererek veya <strong>info@poolemark.com</strong> adresine e-posta göndererek değişiklik talep edebilirsiniz. Kargoya verildikten sonra değişiklik yapılamamaktadır.</p>

<h3>Siparişim ne zaman kargoya verilir?</h3>
<ul>
<li><strong>Hafta içi 14:00''a kadar</strong> verilen siparişler <strong>aynı gün</strong> kargoya verilir</li>
<li>Hafta içi 14:00 sonrası verilen siparişler <strong>bir sonraki iş günü</strong> kargoya verilir</li>
<li><strong>Cumartesi 11:00''e kadar</strong> verilen siparişler <strong>aynı gün</strong> kargoya verilir</li>
<li>Cumartesi 11:00 sonrası ve Pazar günü verilen siparişler <strong>ilk iş günü</strong> kargoya verilir</li>
</ul>

<h2>Ödeme</h2>

<h3>Hangi ödeme yöntemlerini kabul ediyorsunuz?</h3>
<p>Kredi kartı (Visa, Mastercard, Troy), banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Tüm kredi kartı işlemleriniz 256-bit SSL şifreleme ve 3D Secure ile korunmaktadır.</p>

<h3>Taksitli ödeme yapabilir miyim?</h3>
<p>Evet, anlaşmalı bankalarla <strong>3, 6, 9 ve 12 taksit</strong> seçenekleri sunulmaktadır. Taksit seçenekleri ödeme sayfasında görüntülenir.</p>

<h3>Ödeme bilgilerim güvende mi?</h3>
<p>Kesinlikle. Ödeme işlemleriniz PCI DSS uyumlu altyapı üzerinden 3D Secure teknolojisi ile gerçekleştirilir. Kredi kartı bilgileriniz sunucularımızda <strong>kesinlikle saklanmaz</strong>.</p>

<h2>Kargo ve Teslimat</h2>

<h3>Kargo ücreti ne kadar?</h3>
<p><strong>500₺ ve üzeri</strong> tüm siparişlerde kargo ücreti tarafımızca karşılanır. 500₺ altı siparişlerde kargo ücreti sepet sayfasında belirtilir.</p>

<h3>Siparişim ne zaman teslim edilir?</h3>
<p>Kargoya verilen siparişler <strong>1-2 iş günü</strong> içinde adresinize teslim edilir.</p>

<h3>Kargo takibi nasıl yapılır?</h3>
<p>Siparişiniz kargoya verildiğinde kargo takip numaranız e-posta ile gönderilir. Ayrıca hesabınızdaki <strong>Siparişlerim</strong> bölümünden de anlık takip edebilirsiniz.</p>

<h3>Hangi kargo firmalarıyla çalışıyorsunuz?</h3>
<p>MNG Kargo, Yurtiçi Kargo, Sürat Kargo, Aras Kargo ve Kolay Gelsin ile çalışmaktayız. Bölgenize göre en uygun firma otomatik seçilir.</p>

<h2>İade ve Değişim</h2>

<h3>İade hakkım var mı?</h3>
<p>Evet, ürünü teslim aldığınız tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz. Ürünün kullanılmamış ve orijinalliğinin bozulmamış olması gerekmektedir.</p>

<h3>İade ücretsiz mi?</h3>
<p>Evet, tüm iade işlemlerinde kargo ücreti <strong>Poolemark tarafından karşılanır</strong>. İade talebiniz onaylandığında size ücretsiz iade kargo kodu gönderilir.</p>

<h3>İade talebi nasıl oluşturabilirim?</h3>
<p>İade talebinizi 3 farklı kanaldan oluşturabilirsiniz:</p>
<ol>
<li><strong>Müşteri Paneli:</strong> Hesabınızdaki "Siparişlerim" bölümünden iade talebi oluşturabilirsiniz</li>
<li><strong>WhatsApp:</strong> <strong>0 850 840 13 27</strong> numarasına mesaj gönderebilirsiniz</li>
<li><strong>E-posta:</strong> <strong>info@poolemark.com</strong> adresine sipariş numaranızı belirterek başvurabilirsiniz</li>
</ol>

<h3>Hangi ürünler iade edilemez?</h3>
<ul>
<li>Kullanılmış veya denenmiş ürünler</li>
<li>Orijinalliği bozulmuş, hasar verilmiş veya eksik parçalı ürünler</li>
<li>Birden fazla ürün sipariş ettiyseniz, kullandığınız ürünleri iade edemezsiniz; yalnızca kullanılmamış olanları iade edebilirsiniz</li>
</ul>

<h3>Hasarlı ürün gelirse ne yapmalıyım?</h3>
<p>Teslimat tarihinden itibaren <strong>3 gün</strong> içinde fotoğraflı olarak iletişime geçin. Hasarlı ürünlerde tüm masraflar tarafımızca karşılanır ve öncelikli olarak değişim/iade yapılır.</p>

<h2>Hesap ve Üyelik</h2>

<h3>Üye olmadan alışveriş yapabilir miyim?</h3>
<p>Evet, misafir olarak da alışveriş yapabilirsiniz. Ancak üyelikle sipariş takibi, favori listesi, iade talebi oluşturma ve özel kampanyalardan yararlanabilirsiniz.</p>

<h3>Şifremi unuttum, ne yapmalıyım?</h3>
<p>Giriş sayfasındaki <strong>Şifremi Unuttum</strong> bağlantısına tıklayarak e-posta adresinize şifre sıfırlama linki gönderebilirsiniz.</p>

<h3>Hesabımı nasıl silebilirim?</h3>
<p><strong>info@poolemark.com</strong> adresine hesap silme talebinizi iletin. KVKK kapsamında en geç 30 gün içinde işleme alınır.</p>

<h2>İletişim</h2>

<h3>Size nasıl ulaşabilirim?</h3>
<ul>
<li><strong>Telefon:</strong> 0 850 840 13 27 (Hafta içi 09:00 - 18:00, Cumartesi 09:00 - 14:00)</li>
<li><strong>WhatsApp:</strong> 0 850 840 13 27</li>
<li><strong>E-posta:</strong> info@poolemark.com</li>
<li><strong>Adres:</strong> Sedir Mahallesi, NO:18, Muratpaşa / Antalya</li>
</ul>

<p><em>Son güncelleme: Nisan 2026</em></p>
', updated_at = NOW() WHERE slug = 'sss';
