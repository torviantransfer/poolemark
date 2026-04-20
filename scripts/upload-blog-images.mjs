import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Unsplash source URLs for relevant topics
const imageMap = [
  {
    slug: 'fayans-ustune-yapiskanli-duvar-paneli-uygulanir-mi',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=630&fit=crop&q=80',
    filename: 'fayans-ustune-panel.jpg'
  },
  {
    slug: 'banyo-duvar-kaplama-pvc-panel-mi-folyo-mu',
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=630&fit=crop&q=80',
    filename: 'banyo-duvar-kaplama.jpg'
  },
  {
    slug: 'mutfak-tezgah-arasi-folyo-nasil-uygulanir',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=630&fit=crop&q=80',
    filename: 'mutfak-tezgah-arasi.jpg'
  },
  {
    slug: 'kiraci-dostu-ev-yenileme-rehberi',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=630&fit=crop&q=80',
    filename: 'kiraci-ev-yenileme.jpg'
  },
  {
    slug: '3d-tugla-duvar-paneli-boyanir-mi',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&fit=crop&q=80',
    filename: '3d-tugla-panel.jpg'
  },
  {
    slug: 'duvar-paneli-kac-adet-gerekir-metrekare-hesaplama',
    url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&h=630&fit=crop&q=80',
    filename: 'metrekare-hesaplama.jpg'
  },
  {
    slug: 'yapiskanli-folyo-sokulur-mu-iz-birakir-mi',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=630&fit=crop&q=80',
    filename: 'yapiskanli-folyo.jpg'
  },
  {
    slug: 'isiya-suya-dayanikli-kaplama-rehberi',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=630&fit=crop&q=80',
    filename: 'isiya-suya-dayanikli.jpg'
  },
  {
    slug: 'mermer-duvar-paneli-mi-folyo-mu-dogru-secim',
    url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=630&fit=crop&q=80',
    filename: 'mermer-panel-folyo.jpg'
  },
  {
    slug: 'tv-arkasi-3d-panel-secimi-ve-uygulama',
    url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&h=630&fit=crop&q=80',
    filename: 'tv-arkasi-panel.jpg'
  },
];

async function main() {
  for (const item of imageMap) {
    try {
      console.log(`Downloading: ${item.filename}...`);
      const response = await fetch(item.url);
      if (!response.ok) {
        console.error(`  Failed to download: ${response.status}`);
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
        console.error(`  Upload error: ${uploadErr.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from('blog').getPublicUrl(`covers/${item.filename}`);
      const publicUrl = urlData.publicUrl;
      console.log(`  URL: ${publicUrl}`);

      // Update blog post
      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update({ cover_image_url: publicUrl })
        .eq('slug', item.slug);
      
      if (updateErr) {
        console.error(`  DB update error: ${updateErr.message}`);
      } else {
        console.log(`  ✓ Updated ${item.slug}`);
      }
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  console.log('\nDone!');
}

main();
