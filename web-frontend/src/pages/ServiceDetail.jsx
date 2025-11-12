
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Service } from "@/api/entities";
import { CheckCircle2, ArrowLeft, Clock, Shield, Award, Star, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { getBookingLink } from "../components/utils/deviceDetection";
import SEO from "../components/SEO";

export default function ServiceDetail() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const [service, setService] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadService();
  }, [slug]);

  const loadService = async () => {
    if (!slug) return;
    const services = await Service.filter({ slug });
    if (services.length > 0) {
      setService(services[0]);
    }
    setIsLoading(false);
  };

  const handleBookNow = () => {
    const bookingLink = getBookingLink();
    // Simplified the logic as both branches of the original if/else did the same thing.
    // The getBookingLink function already handles the device detection and returns the appropriate URL.
    window.location.href = bookingLink;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist</p>
          <Link to={createPageUrl("Services")}>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
              Browse Services
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": service.title,
    "name": service.title,
    "description": service.full_description || service.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Expertrait",
      "telephone": "+447362388505",
      "email": "support@expertrait.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "14 Forge Lane",
        "addressLocality": "Gillingham",
        "postalCode": "ME7 1UG",
        "addressCountry": "GB"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "GBP",
      "price": "29.00",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "29.00",
        "priceCurrency": "GBP"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "120"
    }
  };

  const benefits = [
    { icon: Shield, title: "100% Satisfaction Guarantee", description: "If you're not happy, we'll make it right" },
    { icon: Award, title: "Verified Professionals", description: "All our pros are background checked" },
    { icon: Clock, title: "Flexible Scheduling", description: "Book at a time that works for you" },
  ];

  return (
    <>
      <SEO 
        title={service.title}
        description={service.full_description || service.description}
        keywords={`${service.title} UK, ${service.title.toLowerCase()}, home ${service.title.toLowerCase()}, professional ${service.title.toLowerCase()}`}
        url={`https://apps.expertrait.com/ServiceDetail?slug=${service.slug}`}
        image={service.image_url}
        structuredData={structuredData}
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link to={createPageUrl("Services")} className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Services</span>
            </Link>
          
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {service.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6">
                {service.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-white text-white" />
                  ))}
                  <span className="ml-2 text-lg font-semibold">4.9</span>
                </div>
                <div className="text-white/80">|</div>
                <div className="text-lg">
                  <span className="font-semibold">1,200+</span> bookings
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {service.image_url && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img 
                      src={service.image_url} 
                      alt={service.title} 
                      className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                    />
                  </motion.div>
                )}

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    About This Service
                  </h2>
                  {service.full_description ? (
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {service.full_description}
                    </p>
                  ) : (
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {service.description}
                    </p>
                  )}
                </motion.div>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
                  >
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                      What's Included
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Why Choose Us
                  </h2>
                  <div className="space-y-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar - Booking Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-lg sticky top-24"
                >
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      Get a Quote
                    </div>
                    <p className="text-gray-600">
                      Book this service now
                    </p>
                  </div>

                  <button 
                    onClick={handleBookNow}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
                  >
                    Book Now
                  </button>

                  <div className="border-t border-gray-200 pt-6 mt-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="text-sm">Response within 24 hours</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-orange-600" />
                      <span className="text-sm">100% Satisfaction Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Award className="w-5 h-5 text-orange-600" />
                      <span className="text-sm">Verified Professionals</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Need help? Contact us
                    </p>
                    <div className="space-y-2">
                      <a href="tel:+447362388505" className="flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold">
                        <Phone className="w-4 h-4" />
                        +44 736 2388505
                      </a>
                      <a href="mailto:support@expertrait.com" className="flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm">
                        <Mail className="w-4 h-4" />
                        support@expertrait.com
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
