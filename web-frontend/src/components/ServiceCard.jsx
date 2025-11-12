import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Wrench, Zap, Sparkles, Heart, Hammer, Paintbrush, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { getBookingLink } from "./utils/deviceDetection";

const iconMap = {
  Wrench,
  Zap,
  Sparkles,
  Heart,
  Hammer,
  Paintbrush,
};

export default function ServiceCard({ service }) {
  const IconComponent = iconMap[service.icon] || Wrench;

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const bookingLink = getBookingLink();
    if (bookingLink.startsWith('http')) {
      window.location.href = bookingLink;
    } else {
      window.location.href = bookingLink;
    }
  };

  return (
    <Link to={`${createPageUrl("ServiceDetail")}?slug=${service.slug}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 h-full border border-gray-100 hover:border-orange-200"
      >
        {service.image_url && (
          <div className="relative h-56 overflow-hidden">
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Icon overlay */}
            <div className="absolute top-4 left-4">
              <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <IconComponent className="w-7 h-7 text-orange-600" />
              </div>
            </div>
            
            {/* Rating badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
              <span className="text-sm font-bold text-gray-900">4.9</span>
              <span className="text-xs text-gray-600">(120+)</span>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
            {service.title}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
            {service.description}
          </p>
          
          {/* Features list */}
          {service.features && service.features.length > 0 && (
            <div className="space-y-2 mb-6">
              {service.features.slice(0, 2).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-600 line-clamp-1">{feature}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">From</span>
              <span className="text-lg font-bold text-orange-600">£29</span>
            </div>
            <button
              onClick={handleBookNow}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm group-hover:gap-3 transition-all"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}