import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Users, Briefcase, Calendar, DollarSign } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Admin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    button_text: 'Learn More'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, bannersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`),
        fetch(`${API_URL}/api/admin/banners`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (bannersRes.ok) {
        const bannersData = await bannersRes.json();
        setBanners(bannersData.banners);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/admin/banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBanner,
          active: true
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner created successfully",
        });
        setNewBanner({ title: '', subtitle: '', button_text: 'Learn More' });
        loadData();
      } else {
        throw new Error('Failed to create banner');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create banner",
        variant: "destructive",
      });
    }
  };

  const handleActivateBanner = async (bannerId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/banner/${bannerId}/activate`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner activated",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate banner",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/banner/${bannerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner deleted",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ExperTrait Admin</h1>
          <p className="text-gray-600">Manage your home services platform</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_customers} customers, {stats.total_professionals} professionals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_bookings}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pending_bookings} pending, {stats.completed_bookings} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services</CardTitle>
                <Briefcase className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_services}</div>
                <p className="text-xs text-gray-500 mt-1">Active services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">From completed bookings</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="banners" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="categories">Featured Categories</TabsTrigger>
            <TabsTrigger value="icons">Category Icons</TabsTrigger>
          </TabsList>

          <TabsContent value="banners">
            <div className="grid gap-6">
              {/* Create New Banner */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Banner</CardTitle>
                  <CardDescription>Add a promotional banner to the home screen</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateBanner} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        placeholder="Limited Time Offer!"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={newBanner.subtitle}
                        onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                        placeholder="Get 20% off on your first booking"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="button_text">Button Text</Label>
                      <Input
                        id="button_text"
                        value={newBanner.button_text}
                        onChange={(e) => setNewBanner({ ...newBanner, button_text: e.target.value })}
                        placeholder="Learn More"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                      Create Banner
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Banners */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Banners</CardTitle>
                  <CardDescription>Manage your promotional banners</CardDescription>
                </CardHeader>
                <CardContent>
                  {banners.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No banners created yet</p>
                  ) : (
                    <div className="space-y-4">
                      {banners.map((banner) => (
                        <div
                          key={banner.id}
                          className={`p-4 border rounded-lg ${
                            banner.active ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg">{banner.title}</h3>
                              <p className="text-gray-600">{banner.subtitle}</p>
                              <p className="text-sm text-gray-500 mt-1">Button: {banner.button_text}</p>
                            </div>
                            <div className="flex gap-2">
                              {!banner.active && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleActivateBanner(banner.id)}
                                >
                                  Activate
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteBanner(banner.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          {banner.active && (
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Featured Categories</CardTitle>
                <CardDescription>
                  Select categories to be featured on the mobile home screen. Categories rotate randomly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Featured categories appear prominently on the customer home screen with highlighted service listings.
                    Select multiple categories to create a rotation pool.
                  </p>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This feature requires backend integration. Currently showing all available categories.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {['Cleaning', 'Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Handyman', 'Painting', 'Landscaping', 'Pest Control', 'Locksmith'].map((category) => (
                      <div key={category} className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category}</span>
                          <input type="checkbox" className="w-5 h-5 text-orange-500" defaultChecked />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                    Save Featured Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="icons">
            <Card>
              <CardHeader>
                <CardTitle>Category Icons</CardTitle>
                <CardDescription>Customize the icon and color for each service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    These icons and colors appear in the category grid on the mobile home screen.
                  </p>
                  <div className="space-y-3">
                    {[
                      { name: 'Cleaning', icon: 'sparkles', color: '#4CAF50' },
                      { name: 'Plumbing', icon: 'water', color: '#2196F3' },
                      { name: 'Electrical', icon: 'flash', color: '#FFB800' },
                      { name: 'HVAC', icon: 'snow', color: '#00BCD4' },
                      { name: 'Appliances', icon: 'construct', color: '#9C27B0' },
                      { name: 'Handyman', icon: 'hammer', color: '#FF6B00' },
                      { name: 'Painting', icon: 'color-palette', color: '#E91E63' },
                      { name: 'Landscaping', icon: 'leaf', color: '#4CAF50' },
                      { name: 'Pest Control', icon: 'bug', color: '#F44336' },
                      { name: 'Locksmith', icon: 'key', color: '#607D8B' },
                    ].map((category) => (
                      <div key={category.name} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-gray-500">Icon: {category.icon}</p>
                        </div>
                        <Input 
                          type="text" 
                          defaultValue={category.icon}
                          className="w-40"
                          placeholder="Icon name"
                        />
                        <Input 
                          type="color" 
                          defaultValue={category.color}
                          className="w-20 h-10"
                        />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                    Save Category Icons
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
