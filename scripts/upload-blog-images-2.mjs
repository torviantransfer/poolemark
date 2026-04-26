// Upload cover images for blog posts set 2 (seo-blog-posts-2.mjs)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const imageMap = [
  {
    slug: 'rutubetli-nemli-duvara-yapiskanli-panel-uygulanir-mi',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=630&fit=crop&q=80',
    filename: 'rutubetli-duvara-panel.jpg'
  },
  {
    slug: 'yapiskanli-folyo-hava-kabarcigi-nasil-giderilir',
    url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&h=630&fit=crop&q=80',
    filename: 'folyo-hava-kabarcigi.jpg'
  },
  {
    slug: 'kapi-kaplama-folyo-mu-boya-mi-karsilastirma',
    url: 'https://images.unsplash.com/photo-1558882224-dda166733046?w=1200&h=630&fit=crop&q=80',
    filename: 'kapi-kaplama-folyo-boya.jpg'
  },
  {
    slug: '3d-pvc-panel-mi-strafor-panel-mi-farklar',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&fit=crop&q=80',
    filename: '3d-pvc-strafor-karsilastirma.jpg'
  },
  {
    slug: 'mutfak-dolabi-kaplama-folyosu-2026-trend-renkler',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=630&fit=crop&q=80',
    filename: 'mutfak-dolabi-folyo-trend.jpg'
  },
  {
    slug: 'dusakabin-ici-folyo-kaplama-rehberi',
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=630&fit=crop&q=80',
    filename: 'dusakabin-folyo-kaplama.jpg'
  },
  {
    slug: '3d-duvar-paneli-arkasina-led-isik-ekleme',
    url: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=1200&h=630&fit=crop&q=80',
    filename: '3d-panel-led-isik.jpg'
  },
  {
    slug: 'ev-ofisi-icin-akustik-duvar-paneli-rehberi',
    url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=630&fit=crop&q=80',
    filename: 'ev-ofisi-akustik-panel.jpg'
  },
  {
    slug: 'buzdolabi-folyo-kaplama-rehberi',
    url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=1200&h=630&fit=crop&q=80',
    filename: 'buzdolabi-folyo-kaplama.jpg'
  },
  {
    slug: 'yapiskanli-duvar-paneli-metrekare-maliyeti-2026',
    url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&h=630&fit=crop&q=80',
    filename: 'panel-metrekare-maliyet.jpg'
  },
];

async function main() {
  console.log('=== Uploading Cover Images for Blog Set 2 ===\n');

  for (const item of imageMap) {
    try {
      console.log(`Downloading: ${item.filename}...`);
      const response = await fetch(item.url);
      if (!response.ok) {
        console.error(`  ✗ Download failed: HTTP ${response.status}`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());

      console.log(`  Uploading to storage (${(buffer.length / 1024).toFixed(0)}KB)...`);
      const { error: uploadErr } = await supabase.storage
        .from('blog')
        .upload(`covers/${item.filename}`, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadErr) {
        console.error(`  ✗ Upload error: ${uploadErr.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from('blog').getPublicUrl(`covers/${item.filename}`);
      const publicUrl = urlData.publicUrl;

      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update({ cover_image_url: publicUrl })
        .eq('slug', item.slug);

      if (updateErr) {
        console.error(`  ✗ DB update error: ${updateErr.message}`);
      } else {
        console.log(`  ✓ ${item.slug}`);
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log('\n=== Done ===');
}

main();
