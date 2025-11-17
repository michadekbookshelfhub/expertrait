import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserDashboard() {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    // User dashboard is now mobile-only
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name || "User"}!
            </h1>
            <p className="text-gray-600">
              Manage your bookings and services
            </p>
          </motion.div>

          {/* Mobile App Required Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="w-10 h-10 text-orange-600" />
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Download the Expertrait Mobile App
                  </h2>
                  
                  <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Book services, track your appointments, and manage payments seamlessly with our full-featured mobile application.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4 text-left">
                      <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Why Mobile App?</h3>
                        <p className="text-sm text-gray-700">
                          The web dashboard has limited functionality. The mobile app provides full access to 
                          book services, track bookings in real-time, communicate with professionals, 
                          and manage payments securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-3">🎯 Easy Booking</h3>
                      <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li>• Browse and book services instantly</li>
                        <li>• Choose preferred date and time</li>
                        <li>• View professional profiles</li>
                        <li>• Read reviews and ratings</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-3">📱 Track & Manage</h3>
                      <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li>• Real-time booking updates</li>
                        <li>• Chat with professionals</li>
                        <li>• Secure payment processing</li>
                        <li>• View booking history</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="https://apps.apple.com/gb/app/expertrait/id6752484611"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial"
                    >
                      <Button size="lg" className="w-full bg-black hover:bg-gray-900 text-white px-8 py-6 text-lg">
                        <span className="mr-3 text-2xl">📱</span>
                        Download for iPhone
                      </Button>
                    </a>
                    <a 
                      href="https://play.google.com/store/apps/details?id=com.v1.expertrait"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial"
                    >
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                        <span className="mr-3 text-2xl">📱</span>
                        Download for Android
                      </Button>
                    </a>
                  </div>

                  <p className="text-sm text-gray-500 mt-6">
                    Free to download • Secure payments • 24/7 support
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.full_name || ""}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> To manage your bookings, update your profile, and access all features, 
                    please use the Expertrait mobile app.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}