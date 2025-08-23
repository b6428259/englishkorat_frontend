import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({
  title = "English Korat - สถาบันสอนภาษาอังกฤษชั้นนำในโคราช",
  description = "สถาบันสอนภาษาอังกฤษที่ดีที่สุดในนครราชสีมา เปลี่ยนชีวิtหลังเรียนใน 3 เดือน เหมาะสำหรับคนอ่อนภาษา เรียนแล้วเห็นผล พร้อมครูเจ้าของภาษา",
  keywords = "เรียนภาษาอังกฤษ โคราช, สถาบันสอนภาษาอังกฤษ นครราชสีมา, เรียนภาษาอังกฤษ ออนไลน์, คอร์สภาษาอังกฤษ, English Korat",
  image = "https://scontent.fbkk9-3.fna.fbcdn.net/v/t39.30808-6/525003966_773847038659861_2013571049567836493_n.png?_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=Oo91aPRnyPYQ7kNvwFjMYio&_nc_oc=AdnEY2iAAhZ8KTqkMkqkbxOhd7s_AHliYGf9EllJZQQoeJzu3iQYhvz1Z7NHYJnt3ORe38fnBM37ixNkw2y2atgx&_nc_zt=23&_nc_ht=scontent.fbkk9-3.fna&_nc_gid=E2YsfkxFJfeEWG8HeZHHHA&oh=00_AfVWAzb6WMXY1E_wOY8esVt8lXnubH5aN_VdB5dOTgQnJQ&oe=68AF324F",
  url = "https://englishkorat.com",
  type = "website"
}: SEOProps) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="English Korat" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Language and Region */}
      <meta httpEquiv="Content-Language" content="th" />
      <meta name="language" content="Thai" />
      <meta name="geo.region" content="TH-30" />
      <meta name="geo.placename" content="Nakhon Ratchasima" />
      <meta name="geo.position" content="14.9810914;102.0610465" />
      <meta name="ICBM" content="14.9810914, 102.0610465" />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="English Korat" />
      <meta property="og:locale" content="th_TH" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@englishkorat" />
      <meta name="twitter:creator" content="@englishkorat" />

      {/* Business/Local SEO */}
      <meta name="business:contact_data:street_address" content="Nakhon Ratchasima" />
      <meta name="business:contact_data:locality" content="Korat" />
      <meta name="business:contact_data:region" content="Nakhon Ratchasima" />
      <meta name="business:contact_data:postal_code" content="30000" />
      <meta name="business:contact_data:country_name" content="Thailand" />
      <meta name="business:contact_data:phone_number" content="+66637623059" />
      <meta name="business:contact_data:email" content="thanida09@gmail.com" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#334293" />
      <meta name="msapplication-TileColor" content="#334293" />
      <meta name="application-name" content="English Korat" />
      <meta name="apple-mobile-web-app-title" content="English Korat" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
}