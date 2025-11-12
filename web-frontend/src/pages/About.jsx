
import React from "react";
import { CheckCircle2, Target, Eye, Award } from "lucide-react";
import SEO from "../components/SEO";

export default function About() {
  const values = [
    {
      icon: CheckCircle2,
      title: "Quality First",
      description: "We maintain the highest standards in every service we provide"
    },
    {
      icon: Target,
      title: "Customer Focused",
      description: "Your satisfaction is our top priority"
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "Clear pricing and honest communication at every step"
    },
    {
      icon: Award,
      title: "Expert Network",
      description: "Connecting you with the best professionals in the industry"
    }
  ];

  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about Expertrait - your trusted platform for connecting with skilled professionals. Our mission is to revolutionize home services with quality, reliability, and transparency."
        keywords="about expertrait, home services platform, professional services UK, trusted professionals"
        url="https://apps.expertrait.com/About"
      />
      <div>
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Expertrait
              </h1>
              <p className="text-xl text-orange-100">
                Your trusted platform for connecting with skilled professionals
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="bg-orange-50 p-8 rounded-2xl">
                <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To revolutionize the way people find and connect with skilled professionals, 
                  ensuring quality, reliability, and transparency in every service interaction.
                </p>
              </div>

              <div className="bg-purple-50 p-8 rounded-2xl">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To become the most trusted platform for professional services, where quality 
                  meets convenience, and every customer finds the perfect expert for their needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-[#FAFAF9]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="mb-4">
                  Expertrait was born from a simple observation: finding reliable, skilled professionals 
                  for home services and personal care shouldn't be complicated or stressful.
                </p>
                <p className="mb-4">
                  We built a platform that brings together the best professionals in various fields, 
                  from plumbing and electrical work to personal care services like massage and hairstyling. 
                  Each professional in our network is carefully vetted to ensure they meet our high standards.
                </p>
                <p>
                  Today, Expertrait serves thousands of satisfied customers, connecting them with trusted 
                  experts who deliver exceptional service every time. We're not just a platform – we're 
                  your partner in finding the right professional for every need.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
