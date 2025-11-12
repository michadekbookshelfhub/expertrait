import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = React.useState(false);
  const whatsappNumber = "447362388505";
  const whatsappMessage = "Hi, I'd like to inquire about your services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative"
      >
        {/* Main Button */}
        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] hover:bg-[#20ba5a] rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer">
          <svg
            viewBox="0 0 32 32"
            className="w-8 h-8 md:w-9 md:h-9 text-white"
            fill="currentColor"
          >
            <path d="M16 0C7.164 0 0 7.164 0 16c0 2.833.744 5.49 2.043 7.797L0 32l8.355-2.017C10.649 31.279 13.248 32 16 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.333c-2.456 0-4.813-.672-6.877-1.943l-.494-.286-5.123 1.238 1.262-4.849-.314-.512A13.254 13.254 0 0 1 2.667 16c0-7.364 5.97-13.333 13.333-13.333S29.333 8.636 29.333 16 23.364 29.333 16 29.333z"/>
            <path d="M23.197 19.27c-.384-.192-2.267-1.12-2.619-1.248-.352-.128-.608-.192-.864.192-.256.384-1.024 1.248-1.248 1.504-.224.256-.448.288-.832.096-.384-.192-1.632-.6-3.104-1.92-1.152-1.024-1.92-2.272-2.144-2.656-.224-.384-.024-.592.168-.784.176-.176.384-.448.576-.672.192-.224.256-.384.384-.64.128-.256.064-.48-.032-.672-.096-.192-.864-2.08-1.184-2.848-.32-.768-.64-.64-.864-.64h-.736c-.256 0-.672.096-.992.48-.32.384-1.248 1.216-1.248 2.976s1.28 3.456 1.472 3.712c.192.256 2.56 3.904 6.208 5.472.864.384 1.536.608 2.064.768.864.288 1.664.256 2.304.16.704-.096 2.144-.88 2.432-1.728.288-.848.288-1.568.192-1.728-.096-.16-.352-.256-.736-.448z"/>
          </svg>
        </div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block absolute right-full top-1/2 -translate-y-1/2 mr-4 whitespace-nowrap"
        >
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-medium">
            Chat with us on WhatsApp
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-900"></div>
            </div>
          </div>
        </motion.div>

        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
        
        {/* Ring Animation */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full border-4 border-[#25D366]"
        />
      </motion.div>

      {/* Mobile Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        transition={{ duration: 0.3 }}
        className="md:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap"
      >
        <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-medium">
          Chat on WhatsApp
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
          </div>
        </div>
      </motion.div>
    </motion.a>
  );
}