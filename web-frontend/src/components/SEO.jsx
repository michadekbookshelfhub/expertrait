import React from "react";

export default function SEO({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = "website",
  structuredData 
}) {
  React.useEffect(() => {
    // Update title
    document.title = title ? `${title} | Expertrait` : "Expertrait - Professional Home Services in UK";
    
    // Update or create meta tags
    const updateMeta = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // Open Graph tags
    updateMeta('og:title', title || 'Expertrait - Professional Home Services', true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', url || 'https://apps.expertrait.com', true);
    updateMeta('og:site_name', 'Expertrait', true);
    updateMeta('og:image', image || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e451d760ab049453fabdd4/d5ccad58d_ExpertraitIcon.png', true);
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title || 'Expertrait - Professional Home Services');
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e451d760ab049453fabdd4/d5ccad58d_ExpertraitIcon.png');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url || 'https://apps.expertrait.com');
    
    // Structured Data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]#structured-data');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'structured-data');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, image, url, type, structuredData]);
  
  return null;
}