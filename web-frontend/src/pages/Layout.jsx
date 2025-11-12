

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Mail, Phone, Menu, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { getBookingLink } from "../components/utils/deviceDetection";
import WhatsAppButton from "./components/WhatsAppButton";
import AuthButtons from "@/components/AuthButtons"; // Import the new AuthButtons component

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // State for authentication status

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const gtagJsId = 'gtag-js-aw-17608694305';
    const gtagConfigId = 'gtag-config-aw-17608694305';

    let script1Ref = null;
    let script2Ref = null;

    // Load Google Analytics (Google Ads Conversion Tracking)
    // Check if the script already exists to prevent duplicate additions, especially in dev mode with HMR.
    if (!document.getElementById(gtagJsId)) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17608694305';
      script1.id = gtagJsId; // Assign an ID for easier identification
      document.head.appendChild(script1);
      script1Ref = script1; // Store reference for cleanup
    }

    if (!document.getElementById(gtagConfigId)) {
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-17608694305');
      `;
      script2.id = gtagConfigId; // Assign an ID for easier identification
      document.head.appendChild(script2);
      script2Ref = script2; // Store reference for cleanup
    }

    // Add base SEO meta tags
    const addMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Viewport and mobile optimization
    addMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
    addMeta('theme-color', '#ea580c');
    
    // Business information
    addMeta('geo.region', 'GB');
    addMeta('geo.placename', 'Gillingham');
    addMeta('geo.position', '51.388;0.548');
    
    // Language
    const html = document.documentElement;
    html.setAttribute('lang', 'en-GB');

    return () => {
      // Only remove the scripts that this specific effect instance *added*.
      if (script1Ref && document.head.contains(script1Ref)) {
        document.head.removeChild(script1Ref);
      }
      if (script2Ref && document.head.contains(script2Ref)) {
        document.head.removeChild(script2Ref);
      }
      // Meta tags and lang attribute are generally not removed on component unmount
      // as they are site-wide SEO settings and not specific to component lifecycle.
    };
  }, []);

  // Mock authentication functions
  const handleLogin = () => {
    // In a real application, this would involve API calls and token storage
    console.log("Simulating login...");
    setIsLoggedIn(true);
    navigate(createPageUrl("Profile")); // Redirect to profile after login
  };

  const handleLogout = () => {
    // In a real application, this would involve clearing tokens/sessions
    console.log("Simulating logout...");
    setIsLoggedIn(false);
    navigate(createPageUrl("Home")); // Redirect to home after logout
  };

  const navigation = [
    { name: "About Us", path: createPageUrl("About") },
    { name: "Services", path: createPageUrl("Services") },
    { name: "Blog", path: createPageUrl("Blog") },
    { name: "Contact", path: createPageUrl("Contact") },
    // Removed "Book Now" from navigation as per outline, now handled by AuthButtons or explicit CTA
  ];

  const isActive = (path) => location.pathname === path;

  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e451d760ab049453fabdd4/d5ccad58d_ExpertraitIcon.png";

  const handleJoinHandlers = () => {
    const bookingLink = getBookingLink(); // Note: This function currently returns a booking link, not a "join handlers" link.
    window.open(bookingLink, '_blank'); // Open in new tab
  };

  const handleBookNow = () => {
    const bookingLink = getBookingLink();
    window.open(bookingLink, '_blank'); // Open in new tab
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          background: #ffffff;
          overflow-x: hidden;
        }
        
        .nav-link {
          position: relative;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          touch-action: manipulation;
          font-weight: 500;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #ea580c;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link:hover::after {
          width: 80%;
        }
        
        .header-shadow {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white header-shadow" 
            : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 md:gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-10 h-10 md:w-12 md:h-12"
              >
                <img 
                  src={logoUrl} 
                  alt="Expertrait Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <span className="text-xl md:text-2xl font-bold text-gray-900">Expertrait</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link text-sm transition-colors ${
                    isActive(item.path)
                      ? "text-orange-600"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons and CTAs */}
            <div className="hidden lg:flex items-center gap-4">
              <AuthButtons
                isLoggedIn={isLoggedIn}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                handleBookNow={handleBookNow}
                handleJoinHandlers={handleJoinHandlers}
              />
            </div>

            {/* Mobile CTAs & Menu */}
            <div className="flex lg:hidden items-center gap-2">
              <Button 
                onClick={handleJoinHandlers}
                size="sm" 
                className="bg-white hover:bg-gray-50 text-orange-600 border-2 border-orange-600 font-semibold px-3 py-2 rounded-lg text-xs"
              >
                Join Handlers
              </Button>
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <Menu className="w-6 h-6 text-gray-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[85vw] max-w-sm bg-white">
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                      <img 
                        src={logoUrl} 
                        alt="Expertrait Logo" 
                        className="w-10 h-10 object-contain"
                      />
                      <span className="text-xl font-bold text-gray-900">Expertrait</span>
                    </div>
                    {navigation.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`text-lg font-semibold transition-colors py-1.5 ${
                          isActive(item.path) ? "text-orange-600" : "text-gray-700 hover:text-orange-600"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <a href="mailto:support@expertrait.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-600 py-1.5">
                        <Mail className="w-5 h-5" />
                        <span>support@expertrait.com</span>
                      </a>
                      <a href="tel:+447362388505" className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-600 py-1.5">
                        <Phone className="w-5 h-5" />
                        <span>+44 736 2388505</span>
                      </a>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <AuthButtons 
                        variant="mobile" 
                        isLoggedIn={isLoggedIn} 
                        handleLogin={handleLogin} 
                        handleLogout={handleLogout} 
                        setIsOpen={setIsOpen} // Pass setIsOpen to close sheet after navigation
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        handleBookNow();
                        setIsOpen(false);
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg py-4"
                    >
                      Book Now
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-3 md:px-4 py-8 md:py-12 lg:py-16">
          <div className="grid grid-cols-3 lg:grid-cols-7 gap-4 md:gap-8 lg:gap-12 mb-6 md:mb-8">
            {/* Company Info */}
            <div className="col-span-3 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={logoUrl} 
                  alt="Expertrait Logo" 
                  className="w-10 h-10 object-contain"
                />
                <span className="text-xl font-bold">Expertrait</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Professional home services at your doorstep. Quality, reliability, and expertise you can trust.
              </p>
              
              {/* App Download Buttons */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <a 
                  href="https://apps.apple.com/gb/app/expertrait/id6752484611"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1234567890" 
                    alt="Download on the App Store" 
                    className="h-12 hover:opacity-80 transition-opacity"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.v1.expertrait&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    className="h-12 hover:opacity-80 transition-opacity"
                  />
                </a>
              </div>

              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                  <a
                    key={index}
                    href="#" // Replace with actual social media links
                    className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-sm md:text-base mb-3 md:mb-4">Quick Links</h3>
              <div className="flex flex-col gap-1.5 md:gap-2">
                {navigation.map((item) => (
                  item.external ? (
                    <a
                      key={item.path}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
            
            {/* Services Column 1 */}
            <div>
              <h3 className="font-bold text-sm md:text-base mb-3 md:mb-4">Home Services</h3>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=plumbing`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Plumbing
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=electrical`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Electrical
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=carpentry`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Carpentry
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=painting`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Painting
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=cleaning`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Cleaning
                </Link>
              </div>
            </div>

            {/* Services Column 2 */}
            <div>
              <h3 className="font-bold text-sm md:text-base mb-3 md:mb-4">Repair Services</h3>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=hvac`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  HVAC
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=locksmith`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Locksmith
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=pest-control`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Pest Control
                </Link>
              </div>
            </div>
            
            {/* Contact Info - MOVED HERE AND CLASS MODIFIED */}
            <div className="lg:col-span-1"> {/* Removed col-span-3 to make it col-span-1 on mobile */}
              <h3 className="font-bold text-sm md:text-base mb-3 md:mb-4">Contact</h3>
              <div className="space-y-2 md:space-y-3">
                <a href="mailto:support@expertrait.com" className="flex items-start gap-2 text-xs md:text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-all">support@expertrait.com</span>
                </a>
                <a href="tel:+447362388505" className="flex items-start gap-2 text-xs md:text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                  <span>+44 736 2388505</span>
                </a>
                <div className="flex items-start gap-2 text-xs md:text-sm text-gray-400">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                  <span>14 Forge Lane, ME7 1UG, Gillingham, UK</span>
                </div>
              </div>
            </div>

            {/* Services Column 3 */}
            <div>
              <h3 className="font-bold text-sm md:text-base mb-3 md:mb-4">Outdoor & More</h3>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=gardening`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Gardening
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=hair-styling`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Hair Styling
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=massage`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Massage
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=landscaping`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Landscaping
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=roofing`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Roofing
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=flooring`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Flooring
                </Link>
                <Link
                  to={`${createPageUrl("ServiceDetail")}?slug=window-cleaning`}
                  className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors py-0.5 md:py-1"
                >
                  Window Cleaning
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-4 md:pt-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center md:text-left">
            <p className="text-gray-400 text-xs md:text-sm">
              &copy; {new Date().getFullYear()} Expertrait. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6">
              <Link to={createPageUrl("Privacy")} className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to={createPageUrl("Terms")} className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to={createPageUrl("Sitemap")} className="text-gray-400 hover:text-orange-500 text-xs md:text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Create src/components/AuthButtons.jsx with the following content:
/*
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

const AuthButtons = ({ isLoggedIn, handleLogin, handleLogout, handleBookNow, handleJoinHandlers, variant, setIsOpen }) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    handleLogin(); // Simulate login process (for demo)
    // In a real app, this would navigate to a login form
    // navigate(createPageUrl("Login"));
    setIsOpen && setIsOpen(false); // Close mobile sheet if open
  };

  const handleGoToSignup = () => {
    // navigate(createPageUrl("Signup"));
    setIsOpen && setIsOpen(false); // Close mobile sheet if open
  };

  const handleGoToProfile = () => {
    navigate(createPageUrl("Profile"));
    setIsOpen && setIsOpen(false); // Close mobile sheet if open
  };

  const onBookNow = () => {
    handleBookNow();
    setIsOpen && setIsOpen(false); // Close mobile sheet if open
  }

  const onJoinHandlers = () => {
    handleJoinHandlers();
    setIsOpen && setIsOpen(false); // Close mobile sheet if open
  }

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-3">
        {isLoggedIn ? (
          <>
            <Button
              onClick={handleGoToProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-4"
            >
              <User className="mr-2 h-5 w-5" /> Profile
            </Button>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-4"
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleGoToLogin}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg py-4"
            >
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
            <Button
              onClick={handleGoToSignup}
              variant="outline"
              className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg py-4"
            >
              <UserPlus className="mr-2 h-5 w-5" /> Signup
            </Button>
          </>
        )}
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="flex items-center gap-4">
      // Contact Info
      <a href="tel:+447362388505" className="text-sm text-gray-700 hover:text-orange-600 transition-colors font-medium">
        +44 736 2388505
      </a>

      // Join Handlers CTA
      <motion.button
        onClick={onJoinHandlers}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-white hover:bg-gray-50 text-orange-600 border-2 border-orange-600 font-semibold px-6 py-2.5 rounded-lg transition-all duration-300"
      >
        Join Handlers
      </motion.button>

      // Authentication Buttons
      {isLoggedIn ? (
        <>
          <motion.button
            onClick={handleGoToProfile}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center"
          >
            <User className="mr-2 h-5 w-5" /> Profile
          </motion.button>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center"
          >
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </motion.button>
        </>
      ) : (
        <>
          <motion.button
            onClick={handleGoToLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white hover:bg-gray-50 text-orange-600 border-2 border-orange-600 font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center"
          >
            <LogIn className="mr-2 h-5 w-5" /> Login
          </motion.button>
          <motion.button
            onClick={handleGoToSignup}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center"
          >
            <UserPlus className="mr-2 h-5 w-5" /> Signup
          </motion.button>
        </>
      )}

      // Book Now CTA
      <motion.button
        onClick={onBookNow}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300"
      >
        Book Now
      </motion.button>
    </div>
  );
};

export default AuthButtons;
*/

