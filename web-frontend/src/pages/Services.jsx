
import React from "react";
import { Service } from "@/api/entities";
import ServiceCard from "../components/ServiceCard";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SEO from "../components/SEO";

export default function Services() {
  const [services, setServices] = React.useState([]);
  const [filteredServices, setFilteredServices] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  React.useEffect(() => {
    loadServices();
  }, []);

  React.useEffect(() => {
    filterServices();
  }, [searchQuery, categoryFilter, services]);

  const loadServices = async () => {
    const data = await Service.list("-created_date");
    setServices(data);
    setFilteredServices(data);
    setIsLoading(false);
  };

  const filterServices = () => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    setFilteredServices(filtered);
  };

  const categories = [
    { value: "all", label: "All Services", count: services.length },
    { value: "home_repair", label: "Home Repair", count: services.filter(s => s.category === "home_repair").length },
    { value: "personal_care", label: "Personal Care", count: services.filter(s => s.category === "personal_care").length },
    { value: "maintenance", label: "Maintenance", count: services.filter(s => s.category === "maintenance").length },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Professional Services",
    "description": "Browse our wide range of professional home services",
    "itemListElement": services.slice(0, 10).map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "provider": {
          "@type": "Organization",
          "name": "Expertrait"
        }
      }
    }))
  };

  return (
    <>
      <SEO 
        title="Professional Services"
        description="Browse our wide range of professional home services including plumbing, electrical, carpentry, cleaning, HVAC, and more. Verified professionals across the UK."
        keywords="home services, plumbing services UK, electrical services UK, carpentry UK, cleaning services, handyman services, professional services"
        url="https://apps.expertrait.com/Services"
        structuredData={structuredData}
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Professional Services
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Browse our wide range of professional services and book with confidence
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <Input
                    placeholder="Search for services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 pr-6 h-16 border-0 rounded-2xl text-lg shadow-2xl focus:ring-2 focus:ring-white/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Services */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Category Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex flex-wrap gap-3 mb-6">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategoryFilter(cat.value)}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        categoryFilter === cat.value
                          ? "bg-orange-600 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {cat.label}
                      <span className="ml-2 opacity-70">({cat.count})</span>
                    </button>
                  ))}
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear filters
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Services Grid */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-white animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : filteredServices.length > 0 ? (
                <motion.div
                  initial="initial"
                  animate="animate"
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ServiceCard service={service} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                  <button
                    onClick={clearFilters}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 md:p-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get in touch with us and we'll help you find the perfect professional for your needs
              </p>
              <a href={`${window.location.origin}${"/Contact".replace(/^\//, "/")}`}>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Contact Us
                </button>
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
