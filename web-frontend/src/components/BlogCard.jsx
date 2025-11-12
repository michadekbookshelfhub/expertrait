import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function BlogCard({ post, variant = "grid", index = 0 }) {
  if (variant === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Link to={`${createPageUrl("BlogDetail")}?slug=${post.slug}`}>
          <Card className="group hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden hover:-translate-y-1">
            <div className="flex flex-col md:flex-row">
              {post.image_url && (
                <div className="md:w-2/5 h-56 md:h-auto overflow-hidden relative">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
              <CardContent className="md:w-3/5 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 mb-4">
                  {post.published_date && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">{format(new Date(post.published_date), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">{post.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">5 min read</span>
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed text-sm sm:text-base">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center text-orange-600 font-semibold group-hover:gap-3 gap-2 transition-all text-sm sm:text-base">
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`${createPageUrl("BlogDetail")}?slug=${post.slug}`}>
        <Card className="group hover:shadow-2xl transition-all duration-500 h-full border border-gray-100 overflow-hidden hover:-translate-y-2">
          <CardContent className="p-0">
            {post.image_url && (
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {post.category && (
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-orange-600">
                    {post.category}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 mb-3">
                {post.published_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">{format(new Date(post.published_date), "MMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600 font-medium text-xs sm:text-sm">5 min read</span>
                </div>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                {post.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed text-sm">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {post.author && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-xs sm:text-sm">{post.author}</span>
                  </div>
                )}
                <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                  <span className="text-xs sm:text-sm">Read More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}