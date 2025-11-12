import React from "react";
import { Service } from "@/api/entities";
import { BlogPost } from "@/api/entities";

export default function SitemapXML() {
  const [xmlContent, setXmlContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      const services = await Service.list();
      const posts = await BlogPost.list();

      const baseUrl = "https://apps.expertrait.com";
      const today = new Date().toISOString().split('T')[0];

      // Static pages with priority and change frequency
      const staticPages = [
        { url: '', priority: '1.0', changefreq: 'daily', lastmod: today },
        { url: '/About', priority: '0.8', changefreq: 'monthly', lastmod: today },
        { url: '/Services', priority: '1.0', changefreq: 'daily', lastmod: today },
        { url: '/Blog', priority: '0.9', changefreq: 'daily', lastmod: today },
        { url: '/Contact', priority: '0.9', changefreq: 'monthly', lastmod: today },
        { url: '/Privacy', priority: '0.5', changefreq: 'yearly', lastmod: today },
        { url: '/Terms', priority: '0.5', changefreq: 'yearly', lastmod: today },
        { url: '/Sitemap', priority: '0.5', changefreq: 'monthly', lastmod: today },
      ];

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Add static pages
      staticPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      });

      // Add service pages
      services.forEach(service => {
        const lastmod = service.updated_date 
          ? new Date(service.updated_date).toISOString().split('T')[0]
          : today;
        
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/ServiceDetail?slug=${service.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += '  </url>\n';
      });

      // Add blog posts
      posts.forEach(post => {
        const lastmod = post.published_date
          ? new Date(post.published_date).toISOString().split('T')[0]
          : today;
        
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/BlogDetail?slug=${post.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n';
      });

      xml += '</urlset>';

      setXmlContent(xml);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    alert("Sitemap XML copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              XML Sitemap Generated
            </h1>
            <p className="text-gray-600 mb-6">
              Your XML sitemap has been generated. You can copy it or download it to submit to Google Search Console.
            </p>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleCopy}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleDownload}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Download sitemap.xml
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  XML Content:
                </h2>
                <span className="text-xs text-gray-500">
                  {xmlContent.split('\n').filter(line => line.includes('<loc>')).length} URLs
                </span>
              </div>
              <pre className="text-xs text-gray-700 overflow-x-auto max-h-96 overflow-y-auto">
                {xmlContent}
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">
              How to Submit to Google Search Console
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Download the sitemap.xml file using the button above</li>
              <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Search Console</a></li>
              <li>Select your property (apps.expertrait.com)</li>
              <li>In the left sidebar, click "Sitemaps"</li>
              <li>Contact the base44 team to upload the sitemap.xml file to your root domain</li>
              <li>Once uploaded, enter "sitemap.xml" in the "Add a new sitemap" field</li>
              <li>Click "Submit"</li>
            </ol>
            <p className="text-sm text-blue-700 mt-4">
              <strong>Note:</strong> Since this is a base44 app, you may need to coordinate with the base44 team to properly host the sitemap.xml file with the correct content-type headers.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-6">
            <h2 className="text-xl font-bold text-orange-900 mb-3">
              Alternative: Direct URL Submission
            </h2>
            <p className="text-orange-800 mb-3">
              While waiting for sitemap setup, you can manually submit important URLs:
            </p>
            <ul className="list-disc list-inside space-y-1 text-orange-800 text-sm">
              <li>Go to Google Search Console → URL Inspection</li>
              <li>Enter each important URL and click "Request Indexing"</li>
              <li>Start with homepage, main pages, then key service and blog pages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}