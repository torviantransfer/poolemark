// SEO Update Script - Updates product meta, descriptions, and creates categories
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== SEO Update Script ===\n');

  // 1. Update Product SEO Meta
  console.log('1. Updating product meta titles and descriptions...');

  const productUpdates = [
    {
      slug: 'beyaz-mermer-desenli-pvc-duvar-kaplama-sticker-suya-yaga-dayanikli',
      meta_title: 'Mermer Desenli Duvar Paneli 60x30 6\'lı Set | Poolemark',
      meta_description: 'Mermer desenli yapışkanlı PVC duvar paneliyle banyo ve mutfağı kırmadan yenileyin. 6\'lı set, suya dayanıklı, kolay uygulama. Hemen inceleyin!',
      description_html: `<h2>Mermer Görünümünü Kırma Dökme Olmadan Yenileyin</h2>
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
<p>Fayans üstü uygulamalar, mutfak tezgah arası yenilemeleri, banyo duvar kaplama projeleri ve dolap içi dekoratif yüzey yenilemeleri için idealdir. Evinizi masrafsız, hızlı ve düzenli şekilde yenilemek istiyorsanız bu set tam size göre.</p>`
    },
    {
      slug: '3d-tugla-desenli-boyanabilir-duvar-paneli-58x38-cm',
      meta_title: '3D Duvar Paneli Tuğla Desenli 58x38 | Poolemark',
      meta_description: 'Kendinden yapışkanlı 3D tuğla duvar paneli ile duvarlarınızı boyanabilir, suya dayanıklı ve kolay uygulanır şekilde yenileyin. Şimdi keşfedin!',
      description_html: `<h2>Duvarlarınıza 3D Tuğla Etkisi Katın</h2>
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
<p>Salon, koridor, çocuk odası, TV arkası veya çalışma alanı gibi farklı mekanlarda modern bir görünüm oluşturur. Temiz ve kuru yüzeye uygulandığında daha iyi sonuç verir. Kes-yapıştır mantığıyla kısa sürede dekoratif bir tuğla duvar görünümü elde etmek isteyen DIY meraklıları için güçlü ve şık bir seçenektir.</p>`
    },
    {
      slug: 'mermer-desenli-folyo-kendinden-yapiskanli',
      meta_title: 'Mermer Desenli Folyo 60cm x 5m | Poolemark',
      meta_description: 'Mermer desenli yapışkanlı folyo ile tezgah, dolap ve fayans yüzeyleri kolayca yenileyin. Suya dayanıklı, ısıya uygun. Hemen satın alın!',
      description_html: `<h2>Tezgah, Dolap ve Fayanslarda Hızlı Yenileme</h2>
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
    }
  ];

  for (const p of productUpdates) {
    const { error } = await supabase
      .from('products')
      .update({
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        description_html: p.description_html,
      })
      .eq('slug', p.slug);
    
    if (error) console.error(`  ✗ ${p.slug}:`, error.message);
    else console.log(`  ✓ ${p.slug}`);
  }

  // 2. Create Categories
  console.log('\n2. Creating SEO categories...');

  const categories = [
    {
      name: 'Duvar Panelleri',
      slug: 'duvar-panelleri',
      description: 'Mutfak, banyo ve yaşam alanları için pratik duvar paneli modelleri',
      meta_title: 'Duvar Paneli Modelleri | Poolemark',
      meta_description: 'Mutfak, banyo ve yaşam alanları için duvar paneli modellerini keşfedin. Kolay uygulanan, şık ve pratik çözümler için hemen inceleyin.',
      sort_order: 1,
      is_active: true,
    },
    {
      name: 'Yapışkanlı Folyolar',
      slug: 'yapiskanli-folyolar',
      description: 'Tezgah, dolap, fayans ve mobilya yüzeyleri için yapışkanlı folyo modelleri',
      meta_title: 'Yapışkanlı Folyo Modelleri | Poolemark',
      meta_description: 'Tezgah, dolap, fayans ve mobilya yüzeyleri için yapışkanlı folyo modellerini keşfedin. Pratik yenileme için hemen bakın.',
      sort_order: 2,
      is_active: true,
    },
    {
      name: 'Mutfak Tezgah Arası Kaplama',
      slug: 'mutfak-tezgah-arasi-kaplama',
      description: 'Mutfak tezgah arası kaplama çözümleri - fayansları kırmadan yenileyin',
      meta_title: 'Mutfak Tezgah Arası Kaplama | Poolemark',
      meta_description: 'Mutfak tezgah arası kaplama çözümleriyle fayansları kırmadan yenileyin. Suya dayanıklı pratik seçenekleri keşfedin.',
      sort_order: 3,
      is_active: true,
    },
    {
      name: 'Banyo Duvar Kaplama',
      slug: 'banyo-duvar-kaplama',
      description: 'Banyoda suya dayanıklı duvar kaplama çözümleri',
      meta_title: 'Banyo Duvar Kaplama Panelleri | Poolemark',
      meta_description: 'Banyoda suya dayanıklı duvar kaplama çözümlerini keşfedin. PVC panel ve yapışkanlı kaplama seçeneklerini şimdi inceleyin.',
      sort_order: 4,
      is_active: true,
    },
  ];

  const createdCategoryIds = {};

  for (const cat of categories) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .single();

    if (existing) {
      console.log(`  → ${cat.name} zaten var, güncelleniyor...`);
      await supabase.from('categories').update(cat).eq('id', existing.id);
      createdCategoryIds[cat.slug] = existing.id;
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert(cat)
        .select('id')
        .single();
      
      if (error) console.error(`  ✗ ${cat.name}:`, error.message);
      else {
        console.log(`  ✓ ${cat.name} (${data.id})`);
        createdCategoryIds[cat.slug] = data.id;
      }
    }
  }

  // 3. Assign products to categories
  console.log('\n3. Assigning products to categories...');

  // Get product IDs
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name');

  const mermerPanel = products.find(p => p.slug === 'beyaz-mermer-desenli-pvc-duvar-kaplama-sticker-suya-yaga-dayanikli');
  const tuglaPanel = products.find(p => p.slug === '3d-tugla-desenli-boyanabilir-duvar-paneli-58x38-cm');
  const mermerFolyo = products.find(p => p.slug === 'mermer-desenli-folyo-kendinden-yapiskanli');

  // Check if product_categories junction table exists
  const { error: junctionError } = await supabase
    .from('product_categories')
    .select('product_id')
    .limit(1);

  if (junctionError) {
    // No junction table - use category_id on products table
    console.log('  Using category_id field on products...');
    
    if (mermerPanel && createdCategoryIds['duvar-panelleri']) {
      await supabase.from('products').update({ category_id: createdCategoryIds['duvar-panelleri'] }).eq('id', mermerPanel.id);
      console.log(`  ✓ ${mermerPanel.name} → Duvar Panelleri`);
    }
    if (tuglaPanel && createdCategoryIds['duvar-panelleri']) {
      await supabase.from('products').update({ category_id: createdCategoryIds['duvar-panelleri'] }).eq('id', tuglaPanel.id);
      console.log(`  ✓ ${tuglaPanel.name} → Duvar Panelleri`);
    }
    if (mermerFolyo && createdCategoryIds['yapiskanli-folyolar']) {
      await supabase.from('products').update({ category_id: createdCategoryIds['yapiskanli-folyolar'] }).eq('id', mermerFolyo.id);
      console.log(`  ✓ ${mermerFolyo.name} → Yapışkanlı Folyolar`);
    }
  } else {
    console.log('  Using product_categories junction table...');
    
    const assignments = [];
    
    // Mermer panel → Duvar Panelleri + Mutfak Tezgah Arası + Banyo Duvar Kaplama
    if (mermerPanel) {
      ['duvar-panelleri', 'mutfak-tezgah-arasi-kaplama', 'banyo-duvar-kaplama'].forEach(slug => {
        if (createdCategoryIds[slug]) {
          assignments.push({ product_id: mermerPanel.id, category_id: createdCategoryIds[slug] });
        }
      });
    }
    
    // Tuğla panel → Duvar Panelleri
    if (tuglaPanel && createdCategoryIds['duvar-panelleri']) {
      assignments.push({ product_id: tuglaPanel.id, category_id: createdCategoryIds['duvar-panelleri'] });
    }
    
    // Mermer folyo → Yapışkanlı Folyolar + Mutfak Tezgah Arası
    if (mermerFolyo) {
      ['yapiskanli-folyolar', 'mutfak-tezgah-arasi-kaplama'].forEach(slug => {
        if (createdCategoryIds[slug]) {
          assignments.push({ product_id: mermerFolyo.id, category_id: createdCategoryIds[slug] });
        }
      });
    }

    for (const a of assignments) {
      const { error } = await supabase
        .from('product_categories')
        .upsert(a, { onConflict: 'product_id,category_id' });
      if (error) {
        // Try insert ignoring conflict
        await supabase.from('product_categories').insert(a).select();
      }
    }
    console.log(`  ✓ ${assignments.length} assignments processed`);
  }

  // 4. Update Mutfak Gereçleri category SEO
  console.log('\n4. Updating existing category SEO...');
  const { error: catError } = await supabase
    .from('categories')
    .update({
      meta_title: 'Ev Gereçleri ve Pratik Yaşam Ürünleri | Poolemark',
      meta_description: 'Yaşam alanlarınıza şıklık katacak dekoratif objeler ve hayatınızı kolaylaştıracak pratik ev gereçleri Poolemark kalitesiyle kapınıza geliyor.',
    })
    .eq('slug', 'mutfak-gerecleri');
  
  if (catError) console.error('  ✗ Mutfak Gereçleri:', catError.message);
  else console.log('  ✓ Mutfak Gereçleri SEO güncellendi');

  console.log('\n=== SEO Update Complete ===');
}

main().catch(console.error);
