-- Seed static pages for Poolemark
-- KVKK, Gizlilik, Çerez, Mesafeli Satış, İade, Kargo, Üyelik Sözleşmesi, Kullanım Koşulları

INSERT INTO public.pages (title, slug, content, is_active, meta_title, meta_description) VALUES

-- KVKK Aydınlatma Metni
('KVKK Aydınlatma Metni', 'kvkk', '
<h2>Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</h2>
<p><strong>Poolemark</strong> olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. Bu doğrultuda 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında sizleri bilgilendirmek isteriz.</p>

<h3>Veri Sorumlusu</h3>
<p><strong>Poolemark</strong><br>
Sedir Mahallesi, NO:18, Muratpaşa / Antalya<br>
Düden Vergi Dairesi - VKN: 2340586838<br>
E-posta: info@poolemark.com | Telefon: 0 850 840 13 27</p>

<h3>Toplanan Kişisel Veriler</h3>
<ul>
<li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
<li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, teslimat adresi</li>
<li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, sepet bilgileri, favori ürünler</li>
<li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, çerez verileri, oturum bilgileri</li>
</ul>

<h3>Kişisel Verilerin İşlenme Amaçları</h3>
<ul>
<li>Üyelik işlemlerinin gerçekleştirilmesi</li>
<li>Sipariş ve teslimat süreçlerinin yönetimi</li>
<li>Müşteri ilişkileri yönetimi ve destek hizmetleri</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Kampanya, indirim ve yeni ürün bilgilendirmeleri (onay verilmesi halinde)</li>
</ul>

<h3>Kişisel Verilerin Aktarımı</h3>
<p>Kişisel verileriniz; kargo şirketleri (teslimat amacıyla), ödeme kuruluşları (ödeme işlemleri için) ve yasal merciler (yasal zorunluluk halinde) ile paylaşılabilir.</p>

<h3>Veri Saklama Süresi</h3>
<p>Kişisel verileriniz, ilgili mevzuatta öngörülen süreler ve işleme amacının gerektirdiği süre boyunca saklanır.</p>

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
</ul>

<p>Başvurularınızı <strong>info@poolemark.com</strong> adresine e-posta göndererek iletebilirsiniz.</p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'KVKK Aydınlatma Metni | Poolemark', 'Poolemark KVKK Kişisel Verilerin Korunması Kanunu aydınlatma metni.'),

-- Gizlilik Politikası
('Gizlilik Politikası', 'gizlilik-politikasi', '
<h2>Gizlilik Politikası</h2>
<p><strong>Poolemark</strong> olarak gizliliğinize saygı duyuyor ve kişisel bilgilerinizi korumayı taahhüt ediyoruz. Bu politika, web sitemizi kullanırken hangi bilgileri topladığımızı, nasıl kullandığımızı ve koruduğumuzu açıklamaktadır.</p>

<h3>Toplanan Bilgiler</h3>
<p>Web sitemizi ziyaret ettiğinizde veya alışveriş yaptığınızda aşağıdaki bilgiler toplanabilir:</p>
<ul>
<li>Ad, soyad ve iletişim bilgileri</li>
<li>Teslimat ve fatura adresi</li>
<li>E-posta adresi ve telefon numarası</li>
<li>Ödeme bilgileri (kredi kartı bilgileri tarafımızca saklanmaz, ödeme kuruluşu tarafından işlenir)</li>
<li>IP adresi, tarayıcı türü, cihaz bilgileri</li>
<li>Alışveriş geçmişi ve tercihler</li>
</ul>

<h3>Bilgilerin Kullanım Amacı</h3>
<ul>
<li>Siparişlerinizi işlemek ve teslimatı gerçekleştirmek</li>
<li>Hesabınızı yönetmek</li>
<li>Müşteri desteği sağlamak</li>
<li>Yasal yükümlülüklerimizi yerine getirmek</li>
<li>Onayınız dahilinde kampanya ve bilgilendirme göndermek</li>
</ul>

<h3>Bilgi Güvenliği</h3>
<p>Kişisel bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Ödeme işlemleriniz PCI DSS uyumlu ödeme altyapısı üzerinden güvenle gerçekleştirilir. Kredi kartı bilgileriniz sunucularımızda saklanmaz.</p>

<h3>Üçüncü Taraflarla Paylaşım</h3>
<p>Kişisel bilgileriniz yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşılır:</p>
<ul>
<li>Kargo ve teslimat hizmetleri için</li>
<li>Ödeme işlemlerinin gerçekleştirilmesi için</li>
<li>Yasal zorunluluk halinde yetkili mercilerle</li>
</ul>

<h3>İletişim</h3>
<p>Gizlilik politikamız hakkında sorularınız için <strong>info@poolemark.com</strong> adresinden bize ulaşabilirsiniz.</p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'Gizlilik Politikası | Poolemark', 'Poolemark gizlilik politikası. Kişisel bilgilerinizin nasıl korunduğunu öğrenin.'),

-- Çerez Politikası
('Çerez Politikası', 'cerez-politikasi', '
<h2>Çerez (Cookie) Politikası</h2>
<p><strong>Poolemark</strong> web sitesi, size daha iyi bir deneyim sunmak amacıyla çerezler kullanmaktadır.</p>

<h3>Çerez Nedir?</h3>
<p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, tercihlerinizi hatırlamamıza ve site deneyiminizi geliştirmemize yardımcı olur.</p>

<h3>Kullanılan Çerez Türleri</h3>

<h4>Zorunlu Çerezler</h4>
<p>Web sitesinin düzgün çalışması için gerekli olan çerezlerdir. Oturum yönetimi, sepet bilgileri ve güvenlik gibi temel işlevleri sağlar. Bu çerezler olmadan site düzgün çalışamaz.</p>

<h4>İşlevsellik Çerezleri</h4>
<p>Dil tercihi, bölge seçimi gibi tercihlerinizi hatırlamak için kullanılır. Bu sayede her ziyaretinizde ayarlarınızı yeniden yapmanıza gerek kalmaz.</p>

<h4>Analitik Çerezler</h4>
<p>Web sitemizin nasıl kullanıldığını anlamamıza yardımcı olur. Sayfa görüntüleme sayıları, ziyaretçi sayıları gibi anonim istatistiksel veriler toplar.</p>

<h3>Çerezleri Yönetme</h3>
<p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak bazı çerezlerin engellenmesi web sitesinin işlevselliğini etkileyebilir.</p>
<ul>
<li><strong>Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
<li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
<li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
<li><strong>Edge:</strong> Ayarlar → Gizlilik → Çerezler</li>
</ul>

<h3>İletişim</h3>
<p>Çerez politikamız hakkında sorularınız için <strong>info@poolemark.com</strong> adresinden bize ulaşabilirsiniz.</p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'Çerez Politikası | Poolemark', 'Poolemark çerez (cookie) politikası hakkında bilgi edinin.'),

-- Mesafeli Satış Sözleşmesi
('Mesafeli Satış Sözleşmesi', 'mesafeli-satis-sozlesmesi', '
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
<li>Alıcı, sipariş verdiği ürün/ürünlerin temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimat bilgilerini okuyup bilgi sahibi olduğunu kabul eder.</li>
<li>Sipariş edilen ürünler, stok durumuna göre en geç 30 iş günü içerisinde teslim edilir.</li>
<li>Ürünler Alıcı''nın belirttiği teslimat adresine kargo ile gönderilir.</li>
</ul>

<h3>5. Cayma Hakkı</h3>
<p>Alıcı, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.</p>

<h3>6. Cayma Hakkının Kullanılamayacağı Durumlar</h3>
<ul>
<li>Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ürünler</li>
<li>Tüketicinin istekleri doğrultusunda özelleştirilen ürünler</li>
<li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
<li>Tesliminden sonra ambalajı açılmış ve iade edilemeyecek nitelikteki ürünler</li>
</ul>

<h3>7. Uyuşmazlık Çözümü</h3>
<p>İşbu sözleşmeden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'Mesafeli Satış Sözleşmesi | Poolemark', 'Poolemark mesafeli satış sözleşmesi.'),

-- İade ve Değişim
('İade ve Değişim Politikası', 'iade-ve-degisim', '
<h2>İade ve Değişim Politikası</h2>
<p><strong>Poolemark</strong> olarak müşteri memnuniyetini ön planda tutuyoruz. Satın aldığınız ürünlerle ilgili iade ve değişim haklarınız aşağıda belirtilmiştir.</p>

<h3>Cayma Hakkı</h3>
<p>6502 sayılı Tüketicinin Korunması Hakkında Kanun gereği, ürünü teslim aldığınız tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz.</p>

<h3>İade Koşulları</h3>
<ul>
<li>Ürün, orijinal ambalajında ve kullanılmamış olmalıdır</li>
<li>Ürün etiketi ve aksesuarları eksiksiz olmalıdır</li>
<li>Fatura veya e-fatura ibraz edilmelidir</li>
<li>İade kargo ücreti alıcıya aittir (hatalı/hasarlı ürün hariç)</li>
</ul>

<h3>Hatalı / Hasarlı Ürün</h3>
<p>Ürün hasarlı veya hatalı ulaştıysa lütfen teslimat tarihinden itibaren <strong>3 gün</strong> içinde bizimle iletişime geçin. Kargo ücreti tarafımızca karşılanacaktır.</p>

<h3>İade Süreci</h3>
<ol>
<li><strong>info@poolemark.com</strong> adresine veya <strong>0 850 840 13 27</strong> numarasına başvurun</li>
<li>İade talebiniz onaylandıktan sonra ürünü kargoya verin</li>
<li>Ürün tarafımıza ulaşıp kontrol edildikten sonra iade işlemi başlatılır</li>
<li>İade tutarı, ödeme yönteminize göre <strong>5-10 iş günü</strong> içinde hesabınıza yansır</li>
</ol>

<h3>Değişim</h3>
<p>Ürün değişimi için aynı iade prosedürü uygulanır. Yeni ürün, iade edilen ürünün tarafımıza ulaşmasının ardından gönderilir.</p>

<h3>İletişim</h3>
<p>İade ve değişim konusundaki tüm sorularınız için:<br>
E-posta: <strong>info@poolemark.com</strong><br>
Telefon: <strong>0 850 840 13 27</strong></p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'İade ve Değişim Politikası | Poolemark', 'Poolemark iade ve değişim koşulları hakkında bilgi edinin.'),

-- Kargo ve Teslimat
('Kargo ve Teslimat', 'kargo-ve-teslimat', '
<h2>Kargo ve Teslimat Bilgileri</h2>

<h3>Kargo Ücreti</h3>
<ul>
<li><strong>500₺ ve üzeri</strong> siparişlerde kargo <strong>ÜCRETSİZ</strong>dir</li>
<li>500₺ altı siparişlerde kargo ücreti sepet sayfasında belirtilir</li>
</ul>

<h3>Teslimat Süresi</h3>
<ul>
<li>Siparişiniz <strong>1-3 iş günü</strong> içinde kargoya verilir</li>
<li>Kargo süresi bulunduğunuz bölgeye göre <strong>1-5 iş günü</strong> arasında değişir</li>
<li>Toplam teslimat süresi ortalama <strong>2-7 iş günüdür</strong></li>
</ul>

<h3>Kargo Takibi</h3>
<p>Siparişiniz kargoya verildiğinde kargo takip numarası e-posta ile gönderilir. Hesabınızdaki "Siparişlerim" bölümünden de kargo durumunu takip edebilirsiniz.</p>

<h3>Teslimat Alanı</h3>
<p>Türkiye''nin <strong>81 iline</strong> teslimat yapılmaktadır.</p>

<h3>Teslimat Sırasında Dikkat Edilecekler</h3>
<ul>
<li>Kargo paketini teslim alırken mutlaka kontrol edin</li>
<li>Hasar veya eksiklik varsa kargo görevlisine tutanak tutturun</li>
<li>Hasarlı ürünü teslim almak zorunda değilsiniz</li>
<li>Teslimat sırasında sorun yaşarsanız <strong>0 850 840 13 27</strong> numarasından bize ulaşın</li>
</ul>

<h3>Anlaşmalı Kargo Firmaları</h3>
<p>Aras Kargo, Yurtiçi Kargo, MNG Kargo, Sürat Kargo ve PTT Kargo ile çalışmaktayız. Bölgenize göre en uygun kargo firması otomatik olarak seçilir.</p>

<h3>İletişim</h3>
<p>Kargo ve teslimat konusundaki sorularınız için:<br>
E-posta: <strong>info@poolemark.com</strong><br>
Telefon: <strong>0 850 840 13 27</strong></p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'Kargo ve Teslimat | Poolemark', 'Poolemark kargo ve teslimat koşulları. Ücretsiz kargo, teslimat süreleri.'),

-- Üyelik Sözleşmesi
('Üyelik Sözleşmesi', 'uyelik-sozlesmesi', '
<h2>Üyelik Sözleşmesi</h2>

<h3>1. Taraflar</h3>
<p>İşbu sözleşme, <strong>Poolemark</strong> (Sedir Mahallesi, NO:18, Muratpaşa / Antalya) ile poolemark.com web sitesine üye olan kullanıcı arasında akdedilmiştir.</p>

<h3>2. Sözleşmenin Konusu</h3>
<p>İşbu sözleşmenin konusu, üyenin poolemark.com web sitesinden yararlanma koşulları ile tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>

<h3>3. Üyelik Koşulları</h3>
<ul>
<li>Üye olmak için 18 yaşını doldurmuş olmak gerekir</li>
<li>Üyelik için geçerli bir e-posta adresi gereklidir</li>
<li>Üye, kayıt sırasında verdiği bilgilerin doğruluğunu taahhüt eder</li>
<li>Hesap bilgilerinin güvenliği üyenin sorumluluğundadır</li>
</ul>

<h3>4. Üyelik Hakları</h3>
<ul>
<li>Alışveriş yapma ve sipariş takibi</li>
<li>Adres defteri oluşturma</li>
<li>Favori ürün listesi oluşturma</li>
<li>Ürün değerlendirme ve yorum yapma</li>
<li>Kampanya ve indirimlerden yararlanma</li>
</ul>

<h3>5. Poolemark''ın Hakları</h3>
<ul>
<li>Hizmet koşullarını önceden bildirimde bulunarak değiştirme</li>
<li>Kurallara uymayan üyelikleri askıya alma veya sonlandırma</li>
<li>Ürün fiyatlarını ve kampanya koşullarını değiştirme</li>
</ul>

<h3>6. Kişisel Verilerin Korunması</h3>
<p>Üyenin kişisel verileri, KVKK Aydınlatma Metni kapsamında işlenir ve korunur.</p>

<h3>7. Uyuşmazlık Çözümü</h3>
<p>İşbu sözleşmeden doğan uyuşmazlıklarda Antalya Mahkemeleri ve İcra Daireleri yetkilidir.</p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'Üyelik Sözleşmesi | Poolemark', 'Poolemark üyelik sözleşmesi.'),

-- Kullanım Koşulları
('Kullanım Koşulları', 'kullanim-kosullari', '
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
<li>Sipariş vermek üyelik gerektirir</li>
<li>Ödeme işlemleri güvenli ödeme altyapısı üzerinden gerçekleştirilir</li>
<li>Poolemark, herhangi bir siparişi kabul etmeme hakkını saklı tutar</li>
</ul>

<h3>5. Sorumluluk Sınırlaması</h3>
<p>Poolemark, web sitesinin kesintisiz veya hatasız çalışacağını garanti etmez. Teknik arızalar, bakım çalışmaları veya mücbir sebepler nedeniyle oluşabilecek aksaklıklardan sorumlu tutulamaz.</p>

<h3>6. Değişiklikler</h3>
<p>Poolemark, işbu kullanım koşullarını önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar.</p>

<h3>7. Uygulanacak Hukuk</h3>
<p>İşbu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Antalya Mahkemeleri yetkilidir.</p>

<p><em>Son güncelleme: Ocak 2025</em></p>
', true, 'Kullanım Koşulları | Poolemark', 'Poolemark web sitesi kullanım koşulları.')

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();
