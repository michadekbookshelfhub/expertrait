
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import SEO from "../components/SEO";

export default function Privacy() {
  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Read Expertrait's privacy policy to understand how we collect, use, and protect your personal information in compliance with UK GDPR."
        keywords="privacy policy, data protection UK, GDPR compliance, personal data"
        url="https://apps.expertrait.com/Privacy"
      />
      <div>
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-orange-100">
                Your privacy is important to us
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

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Introduction</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Expertrait Solutions Limited ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website www.expertrait.com and our mobile application (collectively, the "Service").
                  </p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    By using the Service, you consent to the data practices described in this policy. If you do not agree, please do not access or use our Service.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Data Controller</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Expertrait Solutions Limited, a company registered in England and Wales, is the data controller for the personal data we process. Our registered office is 14 Forge Lane, ME7 1UG, Gillingham, UK.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Information We Collect</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We collect information that you provide directly to us and automatically when you use our Service.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">a) Information You Provide:</h3>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li><strong>Account Information:</strong> Name, email address, phone number, postal address, profile photo, and password when you create an account.</li>
                    <li><strong>Customer Details:</strong> For customers, we collect service request details, appointment times, and property information.</li>
                    <li><strong>Professional Details:</strong> For service professionals ("Handlers"), we collect business name, skills, qualifications, certifications, insurance details, right-to-work documents, payment/bank details, and DBS check information for vetting.</li>
                    <li><strong>Communications:</strong> Records of correspondence if you contact us via email, phone, or in-app messaging.</li>
                    <li><strong>Payment Information:</strong> We use third-party payment processors (e.g., Stripe). We do not store your full card details on our servers.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">b) Information Collected Automatically:</h3>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited, and time spent on the Service.</li>
                    <li><strong>Location Data:</strong> With your permission, we collect your precise or approximate location to match you with local Experts.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. How We Use Your Information</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We use your personal data for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li>To create and manage your account.</li>
                    <li>To facilitate and process transactions and send related information.</li>
                    <li>To vet, verify, and onboard service professionals.</li>
                    <li>To enable communication between customers and Experts.</li>
                    <li>To provide, maintain, and improve our Service.</li>
                    <li>To send you technical notices, security alerts, and support messages.</li>
                    <li>To personalise your experience and provide customer support.</li>
                    <li>For legal and regulatory compliance.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Legal Basis for Processing (UK GDPR)</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We process your data on the following legal bases:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li><strong>Performance of a Contract:</strong> To provide the services you request.</li>
                    <li><strong>Legitimate Interests:</strong> For marketing, fraud prevention, and service improvement.</li>
                    <li><strong>Consent:</strong> Where we ask for your consent, e.g., for marketing communications or location data.</li>
                    <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. How We Share Your Information</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li><strong>Service Professionals:</strong> Necessary details (name, address, job details) are shared to complete a booking.</li>
                    <li><strong>Customers:</strong> An Expert's name, profile, and reviews are visible to facilitate hiring.</li>
                    <li><strong>Service Providers:</strong> Third parties who perform services on our behalf (e.g., payment processing, data analysis, email delivery, vetting services).</li>
                    <li><strong>Legal Authorities:</strong> If required to do so by law or in response to a valid legal request.</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Data Retention</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We will retain your personal information only for as long as is necessary for the purposes set out in this policy, including to fulfil legal, accounting, or reporting requirements. Typically, we retain customer data for 6 years after the last transaction to comply with HMRC requirements.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Your Data Protection Rights</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Under UK data protection law, you have rights including:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                    <li><strong>Access:</strong> The right to request copies of your personal data.</li>
                    <li><strong>Rectification:</strong> The right to request correction of inaccurate information.</li>
                    <li><strong>Erasure:</strong> The right to request the deletion of your personal data.</li>
                    <li><strong>Restriction:</strong> The right to request the suspension of processing of your personal data.</li>
                    <li><strong>Data Portability:</strong> The right to request the transfer of your data to another organisation.</li>
                    <li><strong>Objection:</strong> The right to object to our processing of your personal data.</li>
                  </ul>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    To exercise any of these rights, please contact us at support@expertrait.com.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Data Security</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. However, no internet transmission is ever entirely secure. We cannot guarantee the absolute security of your data.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. International Transfers</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We primarily store data within the UK and European Economic Area (EEA). If we transfer data outside the UK/EEA, we will ensure it is protected by appropriate safeguards, such as Standard Contractual Clauses.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. Changes to This Privacy Policy</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We may update this policy from time to time. The updated version will be indicated by a new "Last Updated" date. We encourage you to review this policy periodically.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Contact Us</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    For any questions about this Privacy Policy or your data, please contact our Data Protection Officer at:
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
