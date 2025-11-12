import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Monitor, Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getDeviceOS, isMobileDevice } from "../components/utils/deviceDetection";

export default function DownloadApp() {
  const deviceOS = getDeviceOS();
  const isMobile = isMobileDevice();

  React.useEffect(() => {
    // If user is on mobile, redirect them to appropriate app store
    if (isMobile) {
      if (deviceOS === 'iOS') {
        window.location.href = 'https://apps.apple.com/gb/app/expertrait/id6752484611';
      } else if (deviceOS === 'Android') {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.v1.expertrait&pcampaignid=web_share';
      }
    }
  }, [isMobile, deviceOS]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e451d760ab049453fabdd4/d5ccad58d_ExpertraitIcon.png"
              alt="Expertrait"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Expertrait
          </h1>
          <p className="text-gray-600">
            Professional services at your doorstep
          </p>
        </div>

        {/* Desktop Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Book Services on Mobile
            </h2>
            <p className="text-gray-600 mb-6">
              To book services with Expertrait, please download our mobile app. We're working on bringing the full experience to desktop soon!
            </p>
          </div>

          {/* App Download Section */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-semibold text-gray-700 text-center mb-4">
              Download our mobile app
            </p>
            
            <div className="flex flex-col gap-3">
              <a
                href="https://apps.apple.com/gb/app/expertrait/id6752484611"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>Download for iPhone</span>
              </a>
              
              <a
                href="https://play.google.com/store/apps/details?id=com.v1.expertrait&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>Download for Android</span>
              </a>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Or scan with your phone camera
            </p>
            <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
              <Smartphone className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              QR code coming soon
            </p>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need help?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <a href="mailto:support@expertrait.com" className="text-orange-600 hover:text-orange-700 font-semibold">
                support@expertrait.com
              </a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <a href="tel:+447362388505" className="text-orange-600 hover:text-orange-700 font-semibold">
                +44 736 2388505
              </a>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to={createPageUrl("Home")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}