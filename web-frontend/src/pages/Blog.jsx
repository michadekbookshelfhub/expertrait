
import React from "react";
import { BlogPost } from "@/api/entities";
import BlogCard from "../components/BlogCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SEO from "../components/SEO";

export default function Blog() {
  const [posts, setPosts] = React.useState([]);
  const [filteredPosts, setFilteredPosts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState("grid");
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    loadPosts();
  }, []);

  React.useEffect(() => {
    filterPosts();
  }, [searchQuery, posts]);

  const loadPosts = async () => {
    const data = await BlogPost.list("-published_date");
    setPosts(data);
    setFilteredPosts(data);
    setIsLoading(false);
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  return (
    <>
      <SEO 
        title="Blog - Tips & Guides"
        description="Read expert tips, guides, and insights about home maintenance, repairs, and professional services. Stay informed with Expertrait's blog."
        keywords="home maintenance tips, home repair guides, DIY tips UK, professional services blog"
        url="https://apps.expertrait.com/Blog"
      />
      <div>
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Blog
              </h1>
              <p className="text-xl text-orange-100">
                Tips, guides, and insights from our experts
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} variant={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No blog posts found.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
