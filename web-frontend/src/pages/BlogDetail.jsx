
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BlogPost } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, Link2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import { getBookingLink } from "../components/utils/deviceDetection";

export default function BlogDetail() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const [post, setPost] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    if (!slug) return;
    const posts = await BlogPost.filter({ slug });
    if (posts.length > 0) {
      setPost(posts[0]);
    }
    setIsLoading(false);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post.title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookNow = () => {
    const bookingLink = getBookingLink();
    window.location.href = bookingLink;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl("Blog")}>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image_url,
    "datePublished": post.published_date,
    "author": {
      "@type": "Organization",
      "name": post.author || "Expertrait"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Expertrait",
      "logo": {
        "@type": "ImageObject",
        "url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e451d760ab049453fabdd4/d5ccad58d_ExpertraitIcon.png"
      }
    }
  };

  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt}
        keywords={`${post.category || 'home tips'}, home services, expertrait blog`}
        url={`https://apps.expertrait.com/BlogDetail?slug=${post.slug}`}
        image={post.image_url}
        type="article"
        structuredData={structuredData}
      />
      <div className="bg-white">
        {/* Hero Section with Image */}
        {post.image_url && (
          <section className="relative h-[50vh] md:h-[60vh] bg-gray-900 overflow-hidden">
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              src={post.image_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-12 md:pb-16">
              <Link 
                to={createPageUrl("Blog")} 
                className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors group w-fit"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Blog</span>
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-4xl"
              >
                {post.category && (
                  <span className="inline-block bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                    {post.category}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {post.title}
                </h1>
              </motion.div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Article Meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8"
              >
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6 pb-6 border-b border-gray-200">
                  {post.published_date && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Published</div>
                        <div className="font-semibold text-gray-900">
                          {format(new Date(post.published_date), "MMMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  )}
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Author</div>
                        <div className="font-semibold text-gray-900">{post.author}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Read time</div>
                      <div className="font-semibold text-gray-900">8 min read</div>
                    </div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share:
                  </span>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 rounded-lg bg-[#1877f2] hover:bg-[#0c63d4] text-white flex items-center justify-center transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 rounded-lg bg-[#1da1f2] hover:bg-[#0c8bd9] text-white flex items-center justify-center transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-10 h-10 rounded-lg bg-[#0a66c2] hover:bg-[#094d92] text-white flex items-center justify-center transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors relative"
                    aria-label="Copy link"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Link2 className="w-5 h-5" />}
                  </button>
                  {copied && (
                    <span className="text-sm text-green-600 font-medium">Copied!</span>
                  )}
                </div>
              </motion.div>

              {/* Article Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8"
              >
                <div className="prose prose-lg max-w-none 
                  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-orange-100 prose-h2:pb-4
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-orange-700
                  prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3 prose-h4:text-gray-800
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-orange-600 prose-a:no-underline prose-a:font-semibold hover:prose-a:underline hover:prose-a:text-orange-700
                  prose-strong:text-gray-900 prose-strong:font-bold
                  prose-em:text-gray-600 prose-em:italic
                  prose-ul:text-gray-700 prose-ul:my-6 prose-ul:space-y-2
                  prose-ol:text-gray-700 prose-ol:my-6 prose-ol:space-y-2
                  prose-li:text-gray-700 prose-li:leading-relaxed
                  prose-li:marker:text-orange-600 prose-li:marker:font-bold
                  prose-blockquote:border-l-4 prose-blockquote:border-orange-600 prose-blockquote:bg-orange-50 
                  prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:my-8
                  prose-code:text-orange-600 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                  prose-hr:border-gray-200 prose-hr:my-12
                  ">
                  <ReactMarkdown
                    components={{
                      h2: ({node, ...props}) => <h2 className="flex items-center gap-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="flex items-center gap-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-none space-y-3" {...props} />,
                      li: ({node, children, ordered, index, ...props}) => {
                        if (ordered) {
                          return (
                            <li className="flex items-start gap-3" {...props}>
                              <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                                {index + 1}
                              </span>
                              <span className="flex-1 pt-0.5">{children}</span>
                            </li>
                          );
                        } else {
                          return (
                            <li className="flex items-start gap-3" {...props}>
                              <span className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                              <span className="flex-1">{children}</span>
                            </li>
                          );
                        }
                      },
                      ol: ({node, ...props}) => <ol className="list-none space-y-3" {...props} />,
                      blockquote: ({node, children, ...props}) => (
                        <blockquote className="relative" {...props}>
                          <div className="absolute -left-2 top-0 text-6xl text-orange-300 opacity-50 leading-none">"</div>
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </motion.div>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Book a Professional?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Get started with Expertrait and experience hassle-free professional services at your doorstep.
                </p>
                <button
                  onClick={handleBookNow}
                  className="bg-white hover:bg-gray-50 text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                >
                  Book Your Service Now
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </motion.div>

              {/* Back to Blog */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center mt-12"
              >
                <Link to={createPageUrl("Blog")}>
                  <Button variant="outline" size="lg" className="font-semibold">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Read More Articles
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
