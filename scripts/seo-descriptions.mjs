// Update product descriptions with SEO-optimized HTML
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const descriptions = {
  'beyaz-mermer-desenli-pvc-duvar-kaplama-sticker-suya-yaga-dayanikli': `<h2>Mermer Görünümünü Kırma Dökme Olmadan Yenileyin</h2>
<p>Mermer desenli yapışkanlı PVC duvar paneli, mutfak tezgah arası, banyo duvarı ve lavabo arkası gibi alanlarda hızlı bir yenileme isteyenler için pratik bir çözümdür. 60x30 cm ölçüsündeki 6 panelden oluşan set, yaklaşık 1.1 m² alan kaplar ve düz, temiz, kuru yüzeylere kolayca uygulanır. Gerçek mermer hissi veren görünümü sayesinde yaşam alanınıza daha modern ve düzenli bir hava kazandırırken, kırma dökme gerektirmeden dekorasyon değişikliği yapmanızı sağlar.</p>

<h3>Neden Poolemark PVC Duvar Panelini Tercih Etmelisiniz?</h3>
<ul>
  <li><strong>Suya ve Yağa Karşı Tam Direnç:</strong> Yüksek kaliteli PVC materyali sayesinde mutfak tezgah arası ve banyo gibi nemli alanlarda güvenle kullanılabilir; leke tutmaz ve kolayca temizlenir.</li>
  <li><strong>Kusursuz Yapışma ve Kolay Uygulama:</strong> Kendinden yapışkanlı yapı sayesinde usta gerektirmeden, düz ve temiz her türlü yüzeye doğrudan uygulanabilir.</li>
  <li><strong>Kiracı Dostu Çözüm:</strong> Uygulandığı yüzeye zarar vermez, dilediğiniz zaman sökülebilir; kiralık evler için ideal bir dekorasyon tercihi.</li>
  <li><strong>Maliyet Etkin Yenileme:</strong> Gerçek mermer estetiğini, seramik işçilik maliyetinin çok altında bir bütçeyle elde etmenizi sağlar.</li>
  <li><strong>Silinebilir Yapı:</strong> Nemli bezle kolayca temizlenir, günlük bakımda pratiklik sunar.</li>
</ul>

<h3>Nerelerde Kullanılır?</h3>
<p>Fayans üstü uygulamalar, mutfak tezgah arası yenilemeleri, banyo duvar kaplama projeleri ve dolap içi dekoratif yüzey yenilemeleri için idealdir. Evinizi masrafsız, hızlı ve düzenli şekilde yenilemek istiyorsanız bu set tam size göre.</p>`,

  '3d-tugla-desenli-boyanabilir-duvar-paneli-58x38-cm': `<h2>Duvarlarınıza 3D Tuğla Etkisi Katın</h2>
<p>Kendinden yapışkanlı 3D tuğla desenli boyanabilir duvar paneli, klasik duvar görünümünü kısa sürede dönüştürmek isteyen kullanıcılar için tasarlanmıştır. 58x38 cm ölçüsündeki paneller, paket içinde 6 adet olarak gelir ve yaklaşık 1.1 m² alan kaplar. Yüksek kabartmalı 3D dokusu duvara derinlik kazandırırken, boyanabilir yüzeyi dekorasyonu kendi tarzınıza göre kişiselleştirmenize yardımcı olur.</p>

<h3>Öne Çıkan Özellikler ve Avantajlar</h3>
<ul>
  <li><strong>Sınırsız Renk Seçeneği:</strong> Boyanabilir yüzeye sahiptir. Su bazlı boyalarla dilediğiniz renge boyayarak dekorasyonunuzu tamamen kişiselleştirebilirsiniz.</li>
  <li><strong>Isı ve Ses Yalıtımı:</strong> PE köpük materyali, ortam akustiğini iyileştirir ve duvarlardan gelen soğuğu keserek enerji tasarrufuna yardımcı olur.</li>
  <li><strong>Güvenli ve Darbe Emici:</strong> Yumuşak dokusu sayesinde çocuk odalarında, kreşlerde ve oyun alanlarında güvenli bir ortam yaratır.</li>
  <li><strong>Pratik Montaj:</strong> Makasla kolayca kesilebilir. Kendinden yapışkanlı arka yüzeyi sayesinde usta çağırmadan kendi başınıza uygulayabilirsiniz.</li>
  <li><strong>Duvar Kusurlarını Gizleme:</strong> 3D tuğla dokusu sayesinde mevcut duvar kusurlarını kapatır ve dekoratif bir görünüm yaratır.</li>
</ul>

<h3>Kullanım Önerisi</h3>
<p>Salon, koridor, çocuk odası, TV arkası veya çalışma alanı gibi farklı mekanlarda modern bir görünüm oluşturur. Temiz ve kuru yüzeye uygulandığında daha iyi sonuç verir. Kes-yapıştır mantığıyla kısa sürede dekoratif bir tuğla duvar görünümü elde etmek isteyen DIY meraklıları için güçlü ve şık bir seçenektir.</p>`,

  'mermer-desenli-folyo-kendinden-yapiskanli': `<h2>Tezgah, Dolap ve Fayanslarda Hızlı Yenileme</h2>
<p>Mermer desenli kendinden yapışkanlı folyo, mutfak ve banyo yüzeylerini kırma dökme olmadan yenilemek isteyenler için ekonomik ve şık bir kaplama çözümüdür. 60 cm genişlik ve 5 metre uzunluk sunan rulo formu; tezgah, dolap kapağı, masa, raf, fayans ve benzeri düz yüzeylerde rahat kullanım sağlar.</p>

<h3>Teknik Özellikler ve Kullanım Alanları</h3>
<ul>
  <li><strong>Isı ve Suya Karşı Maksimum Direnç:</strong> Mutfak tezgahları için özel olarak geliştirilmiştir; sürekli su etkisine ve sıcak tencere temasına karşı son derece dayanıklıdır.</li>
  <li><strong>Kolay Uygulama ve Esneklik:</strong> PVC yapısı sayesinde fön makinesi yardımıyla ısıtılarak köşelere ve kavisli yüzeylere mükemmel uyum sağlar. Kabarcık yapmayan teknolojisiyle pürüzsüz bir bitiş sunar.</li>
  <li><strong>Leke Tutmaz ve Temizlenebilir:</strong> Nemli bir bezle kolayca silinebilir, mutfaktaki yağ ve kir birikintilerine karşı koruma kalkanı oluşturur.</li>
  <li><strong>Izgaralı Arka Yüzey:</strong> Arka yüzeyindeki kılavuz çizgiler, ölçme ve kesme işlemini daha kontrollü hale getirir.</li>
  <li><strong>Geniş Kullanım Yelpazesi:</strong> Mutfak dolabı, tezgah üstü, masa, sehpa, buzdolabı ve tüm düz yüzeyli mobilyalarınızı yenilemek için idealdir.</li>
</ul>

<h3>Kimin İçin Uygun?</h3>
<p>Kiracı dostu, bütçe kontrollü ve hızlı dekorasyon çözümleri arayan kullanıcılar için idealdir. Eskiyen yüzeyleri kısa sürede daha temiz, ferah ve premium bir görünüme taşımak istiyorsanız güçlü ve kullanışlı bir alternatiftir.</p>`
};

async function main() {
  for (const [slug, description] of Object.entries(descriptions)) {
    const { error } = await supabase
      .from('products')
      .update({ description })
      .eq('slug', slug);
    console.log(error ? `✗ ${slug}: ${error.message}` : `✓ ${slug}`);
  }
}

main();
