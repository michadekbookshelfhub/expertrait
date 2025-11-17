
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, CheckCircle2, Smartphone, Download, Star, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
// Removed: getBookingLink and getDeviceOS are no longer used after the changes.
import SEO from "../components/SEO";

export default function Contact() {
  const [contactForm, setContactForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");

    try {
      // Save to database
      await base44.entities.ContactMessage.create(contactForm);

      // Clear form on success
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });

      // Show success message
      setShowSuccess(true);
      
      // Auto-hide success message after 8 seconds
      setTimeout(() => setShowSuccess(false), 8000);
      
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setShowError(true);
      setErrorMessage(
        error.message || 
        "Failed to send your message. Please try again or contact us directly at support@apps.expertrait.com"
      );
      
      // Auto-hide error message after 10 seconds
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
      }, 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removed: handleDownloadApp is no longer needed as direct links are used.

  // Removed: deviceOS is no longer needed after the changes.

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "support@apps.expertrait.com",
      link: "mailto:support@apps.expertrait.com",
      description: "Get in touch anytime"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+44 736 2388505",
      link: "tel:+447362388505",
      description: "Mon-Fri, 9am-6pm GMT"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "14 Forge Lane, ME7 1UG, Gillingham, UK",
      link: null,
      description: "Serving UK nationwide"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Expertrait",
    "description": "Get in touch with Expertrait for professional home services",
    "mainEntity": {
      "@type": "Organization",
      "name": "Expertrait",
      "telephone": "+447362388505",
      "email": "support@apps.expertrait.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "14 Forge Lane",
        "addressLocality": "Gillingham",
        "postalCode": "ME7 1UG",
        "addressCountry": "GB"
      }
    }
  };

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with Expertrait. Call us at +44 736 2388505 or email support@apps.expertrait.com. We're here to help with all your home service needs."
        keywords="contact expertrait, home services contact UK, book services UK, professional services inquiry"
        url="https://apps.expertrait.com/Contact"
        structuredData={structuredData}
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-600 to-orange-700 py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Get In Touch
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                We're here to help. Send us a message or book a service through our mobile app.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Contact Info Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                    Contact Information
                  </h2>

                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <info.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {info.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {info.description}
                          </p>
                          {info.link ? (
                            <a 
                              href={info.link} 
                              className="text-orange-600 hover:text-orange-700 font-semibold break-all transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-gray-700 font-semibold">
                              {info.value}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Quick Response Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-orange-50 border border-orange-200 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          Quick Response Time
                        </h3>
                        <p className="text-sm text-gray-600">
                          We typically respond within 24 hours during business days.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Forms Section */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-2"
                >
                  {/* Success Alert */}
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="mb-6"
                    >
                      <Alert className="border-green-200 bg-green-50 shadow-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium ml-2">
                          <strong>Success!</strong> Your message has been received. Our team will review it and get back to you within 24 hours at the email address you provided.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Error Alert */}
                  {showError && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="mb-6"
                    >
                      <Alert className="border-red-200 bg-red-50 shadow-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <AlertDescription className="text-red-800 font-medium ml-2">
                          <strong>Error!</strong> {errorMessage}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <Card className="border-none shadow-xl">
                    <CardHeader className="border-b border-gray-100 bg-white p-6 md:p-8">
                      <CardTitle className="text-2xl md:text-3xl text-gray-900">
                        How Can We Help?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                      <Tabs defaultValue="contact" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100 p-1">
                          <TabsTrigger 
                            value="contact" 
                            className="text-sm md:text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                          >
                            Contact Us
                          </TabsTrigger>
                          <TabsTrigger 
                            value="booking" 
                            className="text-sm md:text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                          >
                            Book Service
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="contact" className="mt-0">
                          <form onSubmit={handleContactSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                                  Full Name *
                                </Label>
                                <Input
                                  id="name"
                                  required
                                  placeholder="John Doe"
                                  value={contactForm.name}
                                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div>
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                                  Email Address *
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  required
                                  placeholder="john@example.com"
                                  value={contactForm.email}
                                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
                                  Phone Number
                                </Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder="+44 7XXX XXXXXX"
                                  value={contactForm.phone}
                                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div>
                                <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 mb-2 block">
                                  Subject
                                </Label>
                                <Input
                                  id="subject"
                                  placeholder="How can we help?"
                                  value={contactForm.subject}
                                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-2 block">
                                Message *
                              </Label>
                              <Textarea
                                id="message"
                                rows={6}
                                required
                                placeholder="Tell us more about your inquiry..."
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
                                disabled={isSubmitting}
                              />
                            </div>

                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Sending Message...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Mail className="w-5 h-5" />
                                  Send Message
                                </span>
                              )}
                            </Button>
                          </form>
                        </TabsContent>

                        <TabsContent value="booking" className="mt-0">
                          <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-2xl p-8 md:p-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                              <Smartphone className="w-10 h-10 text-white" />
                            </div>

                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                              Book Services on Our Mobile App
                            </h3>
                            
                            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-md mx-auto">
                              Experience seamless booking with the Expertrait mobile app. Quick, secure, and convenient.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                              <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm">
                                <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                                <span className="font-semibold text-sm md:text-base">4.9 Rating</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm">
                                <Download className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-sm md:text-base">10K+ Downloads</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-sm md:text-base">Verified Pros</span>
                              </div>
                            </div>

                            {/* Replaced the single download button with two platform-specific links */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                              <motion.a
                                href="https://apps.apple.com/gb/app/expertrait/id6752484611"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-block"
                              >
                                <img 
                                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1234567890" 
                                  alt="Download on the App Store" 
                                  className="h-14 hover:opacity-90 transition-opacity"
                                />
                              </motion.a>
                              <motion.a
                                href="https://play.google.com/store/apps/details?id=com.v1.expertrait&pcampaignid=web_share"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-block"
                              >
                                <img
                                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                                  alt="Get it on Google Play"
                                  className="h-14 hover:opacity-90 transition-opacity"
                                />
                              </motion.a>
                            </div>
                            {/* Removed conditional text based on deviceOS */}

                            <div className="mt-10 pt-10 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-4">Why use our app?</p>
                              <div className="grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
                                {[
                                  "Instant booking",
                                  "Real-time tracking",
                                  "Secure payments",
                                  "24/7 support"
                                ].map((feature, index) => (
                                  <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
