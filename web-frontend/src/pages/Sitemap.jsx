import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Home, Info, Briefcase, BookOpen, Mail, Shield, FileCheck } from "lucide-react";
import SEO from "../components/SEO";

export default function Sitemap() {
  const pages = [
    {
      icon: Home,
      name: "Home",
      path: createPageUrl("Home"),
      description: "Professional home services at your doorstep"
    },
    {
      icon: Info,
      name: "About Us",
      path: createPageUrl("About"),
      description: "Learn about Expertrait and our mission"
    },
    {
      icon: Briefcase,
      name: "Services",
      path: createPageUrl("Services"),
      description: "Browse all our professional services"
    },
    {
      icon: BookOpen,
      name: "Blog",
      path: createPageUrl("Blog"),
      description: "Tips, guides, and insights"
    },
    {
      icon: Mail,
      name: "Contact",
      path: createPageUrl("Contact"),
      description: "Get in touch with us"
    },
    {
      icon: Shield,
      name: "Privacy Policy",
      path: createPageUrl("Privacy"),
      description: "How we protect your data"
    },
    {
      icon: FileCheck,
      name: "Terms of Service",
      path: createPageUrl("Terms"),
      description: "Our terms and conditions"
    }
  ];

  const services = [
    { name: "Plumbing", slug: "plumbing" },
    { name: "Electrical", slug: "electrical" },
    { name: "Carpentry", slug: "carpentry" },
    { name: "Painting", slug: "painting" },
    { name: "Cleaning", slug: "cleaning" },
    { name: "HVAC", slug: "hvac" },
    { name: "Locksmith", slug: "locksmith" },
    { name: "Pest Control", slug: "pest-control" },
    { name: "Gardening", slug: "gardening" },
    { name: "Hair Styling", slug: "hair-styling" },
    { name: "Massage", slug: "massage" },
    { name: "Landscaping", slug: "landscaping" },
    { name: "Roofing", slug: "roofing" },
    { name: "Flooring", slug: "flooring" },
    { name: "Window Cleaning", slug: "window-cleaning" }
  ];

  return (
    <>
      <SEO 
        title="Sitemap"
        description="Browse all pages and services available on Expertrait. Find professional home services, read our blog, and learn more about us."
        keywords="sitemap, all pages, all services, site navigation"
        url="https://apps.expertrait.com/Sitemap"
      />
      <div className="bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Sitemap
              </h1>
              <p className="text-xl text-orange-100">
                Browse all pages and services on Expertrait
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Main Pages */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Main Pages</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages.map((page, index) => (
                    <Link
                      key={index}
                      to={page.path}
                      className="bg-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-orange-200 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                          <page.icon className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                            {page.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {page.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">All Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service, index) => (
                    <Link
                      key={index}
                      to={`${createPageUrl("ServiceDetail")}?slug=${service.slug}`}
                      className="bg-white p-4 rounded-lg hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-orange-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {service.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}