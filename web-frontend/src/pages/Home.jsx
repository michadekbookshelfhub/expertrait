
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Service } from "@/api/entities";
import { CheckCircle2, Users, Shield, Clock, ArrowRight, Star, Award, ThumbsUp, Quote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ServiceCard from "../components/ServiceCard";
import { getBookingLink } from "../components/utils/deviceDetection";
import SEO from "../components/SEO";
import AuthButtons from "../components/AuthButtons";

export default function Home() {
  const [services, setServices] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const data = await Service.list("-created_date", 6);
    setServices(data);
    setIsLoading(false);
  };

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Homeowner",
      content: "Exceptional service! The plumber arrived on time, was professional, and fixed our issue quickly. Highly recommend!",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Business Owner",
      content: "We use Expertrait for all our office maintenance. Reliable, professional, and great value for money.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Property Manager",
      content: "Managing multiple properties is easy with Expertrait. Their professionals are vetted and trustworthy.",
      rating: 5
    }
  ];

  const trustBadges = [
    { icon: Shield, text: "100% Satisfaction Guarantee" },
    { icon: CheckCircle2, text: "Verified Professionals" },
    { icon: Award, text: "Quality Assured" },
    { icon: Clock, text: "24/7 Support" }
  ];

  const handleBookNow = () => {
    const bookingLink = getBookingLink();
    window.location.href = bookingLink;
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Expertrait",
    "description": "Professional home services at your doorstep. Connect with verified, skilled professionals for all your home and personal care needs.",
    "url": "https://apps.expertrait.com",
    "telephone": "+447362388505",
    "email": "support@expertrait.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "14 Forge Lane",
      "addressLocality": "Gillingham",
      "postalCode": "ME7 1UG",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "51.388",
      "longitude": "0.548"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "priceRange": "£29-£200",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/expertrait",
      "https://www.twitter.com/expertrait",
      "https://www.instagram.com/expertrait",
      "https://www.linkedin.com/company/expertrait"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1200"
    }
  };

  return (
    <>
      <SEO 
        title="Professional Home Services in UK"
        description="Connect with verified, skilled professionals for plumbing, electrical, carpentry, cleaning, and more. Quality service guaranteed. Book now on Expertrait."
        keywords="home services UK, plumber UK, electrician UK, handyman UK, cleaning services UK, home repair UK, professional services Gillingham"
        url="https://apps.expertrait.com"
        structuredData={structuredData}
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-orange-50 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b35' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Star className="w-4 h-4 fill-orange-500" />
                  Trusted by 1000+ Happy Customers
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Professional Home Services
                  <span className="block text-orange-600 mt-2">At Your Doorstep</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                  Connect with verified, skilled professionals for all your home and personal care needs. Quality service, guaranteed.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <motion.button
                    onClick={handleBookNow}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 sm:flex-initial w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Book Now
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <Link to={createPageUrl("Contact")} className="flex-1 sm:flex-initial">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                    >
                      Get a Quote
                    </motion.button>
                  </Link>
                </div>

                {/* Desktop Dashboard Access */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 mb-8"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Already have an account? Access your dashboard:
                  </p>
                  <AuthButtons />
                </motion.div>
                
                {/* Trust Badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trustBadges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="flex flex-col items-center text-center p-3"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                        <badge.icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{badge.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative hidden lg:block"
              >
                <div className="relative z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop" 
                    alt="Professional Service" 
                    className="rounded-2xl shadow-2xl w-full h-auto"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">500+</div>
                        <div className="text-sm text-gray-600">Verified Professionals</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-2xl blur-3xl opacity-20 -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-30 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-30 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" />
                Our Services
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Popular Services
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                From home repairs to personal care, find trusted professionals for every need
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              >
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.6,
                          ease: [0.6, -0.05, 0.01, 0.99]
                        }
                      }
                    }}
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-16"
            >
              <Link to={createPageUrl("Services")}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  View All Services
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
              
              <p className="text-gray-500 text-sm mt-6">
                Browse through {services.length}+ professional services
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Get started in three simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Choose Your Service",
                  description: "Browse our services and select what you need"
                },
                {
                  step: "2",
                  title: "Book Instantly",
                  description: "Pick a time that works for you and confirm your booking"
                },
                {
                  step: "3",
                  title: "Get It Done",
                  description: "A verified professional arrives and completes the job"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of satisfied customers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-orange-200 mb-3" />
                  <p className="text-gray-700 mb-4 leading-relaxed">{testimonial.content}</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-orange-600 to-orange-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Experience Professional Service?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Book your service today and join our community of satisfied customers
              </p>
              <button 
                onClick={handleBookNow}
                className="bg-white hover:bg-gray-50 text-orange-600 px-10 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
