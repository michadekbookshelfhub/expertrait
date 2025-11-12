
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import SEO from "../components/SEO"; // Assuming SEO component is in ../components/SEO

export default function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Read Expertrait's terms of service governing the use of our platform for connecting customers with professional service providers in the UK."
        keywords="terms of service, terms and conditions, user agreement, service terms UK"
        url="https://apps.expertrait.com/Terms"
      />
      <div>
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-orange-100">
                Please read these terms carefully
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto border-none shadow-lg">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-8 text-base">
                    <strong>Last Updated:</strong> 7 October 2025
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    These Terms of Use ("Terms") govern your access to and use of the Expertrait website (www.expertrait.com), mobile application, and services (collectively, the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Platform.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Definitions</h2>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li><strong>"Customer"</strong> means a user who requests and pays for home services via the Platform.</li>
                    <li><strong>"Handlers" or "Professional"</strong> means a vetted service provider who offers and provides services to Customers via the Platform.</li>
                    <li><strong>"Service" or "Booking"</strong> means a home service task requested by a Customer and accepted by an Expert.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. User Accounts</h2>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li>You must be at least 18 years old to use the Platform.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
                    <li>You agree to provide accurate, current, and complete information during registration and to update it promptly.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Services and Bookings</h2>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li>The Platform is a marketplace that connects Customers with Experts. Expertrait is not an employer of Experts and does not itself provide the services.</li>
                    <li>Customers agree to provide accurate information necessary for the Handler to complete the Service (e.g., access details, specific requirements).</li>
                    <li>Handlers are independent contractors solely responsible for the quality, timing, and provision of their services. They must hold all necessary qualifications, licenses, and insurance.</li>
                    <li>A Booking is a direct contract between the Customer and the Handler. Expertrait is not a party to that contract.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Payments and Financial Terms</h2>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li>Customers agree to pay the total amount displayed for a Service, which includes the Handler's fee and Expertrait's commission.</li>
                    <li>All payments are processed securely through our third-party payment partners. Funds are held in escrow until the Customer confirms job completion.</li>
                    <li>Handlers agree to pay Expertrait a commission on each completed transaction, as detailed in the Handler agreement.</li>
                    <li>Cancellation policies may apply. Fees may be charged for late cancellations.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. User Conduct and Responsibilities</h2>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">All Users Agree Not To:</h3>
                  <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                    <li>Use the Platform for any illegal or unauthorized purpose.</li>
                    <li>Harass, abuse, or harm another person.</li>
                    <li>Post false, misleading, or deceptive content.</li>
                    <li>Interfere with or disrupt the Platform's operation.</li>
                  </ul>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Experts Additionally Agree To:</h3>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li>Perform services with reasonable skill, care, and diligence.</li>
                    <li>Comply with all applicable laws and safety standards.</li>
                    <li>Not solicit or accept payments outside the Platform for services arranged through it.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Intellectual Property</h2>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li>All content on the Platform (text, graphics, logos, software) is the property of Expertrait or its licensors and is protected by intellectual property laws.</li>
                    <li>Users are granted a limited, non-exclusive license to access and use the Platform for its intended purposes.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Disclaimer of Warranties</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    The Platform is provided on an "as is" and "as available" basis. Expertrait makes no warranties, express or implied, regarding the reliability, timeliness, quality, or availability of the services offered by Experts.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Limitation of Liability</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    To the fullest extent permitted by law, Expertrait shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Platform or services provided by Experts.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Indemnification</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    You agree to indemnify and hold harmless Expertrait and its officers, directors, employees, and agents from any claims, damages, or expenses (including legal fees) arising from your use of the Platform or violation of these Terms.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. Termination</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We may suspend or terminate your account and access to the Platform at our sole discretion, without notice, for conduct we believe violates these Terms or is harmful to other users, us, or third parties.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Governing Law and Dispute Resolution</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">13. Changes to Terms</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will provide notice of changes by updating the "Last Updated" date. Your continued use of the Platform constitutes acceptance of the revised Terms.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">14. Contact Us</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    For questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                    <p className="text-gray-700 mb-2">
                      <strong>Email:</strong> <a href="mailto:support@expertrait.com" className="text-orange-600 hover:text-orange-700">support@expertrait.com</a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Post:</strong> Expertrait Solutions Limited, 14 Forge Lane, ME7 1UG, Gillingham, UK
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
