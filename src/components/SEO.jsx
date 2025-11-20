import { Helmet } from 'react-helmet-async';
import { FRONTEND_URL } from '../utils/constants';

export default function SEO({ 
  title, 
  description, 
  path = '', 
  type = 'website',
  image = '/og-image.jpg',
  robots = 'index, follow',
  keywords,
  author = 'Sendly',
  locale = 'en_US',
  imageWidth = 1200,
  imageHeight = 630,
  jsonLd,
}) {
  const siteUrl = FRONTEND_URL;
  const fullUrl = `${siteUrl}${path}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      <html lang="en" />
      <title>{title} | Sendly</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={`${title} | Sendly`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:site_name" content="Sendly" />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | Sendly`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={description} />
      
      {/* Additional */}
      <meta name="theme-color" content="#020202" />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
