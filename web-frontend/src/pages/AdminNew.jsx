import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Menu, X, Users, Briefcase, Building2, 
  CreditCard, Calendar, DollarSign, Settings, Package,
  TrendingUp, TrendingDown, Activity, ChevronDown, ChevronUp
} from 'lucide-react';

export default function AdminNew() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    if (activePage === 'dashboard') {
      loadStats();
    }
  }, [activePage]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Use relative URL since we're on the same domain
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'handlers', label: 'Handlers', icon: Briefcase },
    { id: 'partners', label: 'Partners', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      subItems: [
        { id: 'company', label: 'Company Settings' },
        { id: 'stripe', label: 'Stripe Settings' }
      ]
    },
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMenuClick = (menuId, hasSubItems) => {
    if (hasSubItems) {
      toggleMenu(menuId);
    } else {
      setActivePage(menuId);
    }
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );

  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      );
    }

    if (!stats) return null;

    return (
      <div className="space-y-6">
        {/* Users Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Users Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={stats.users.total.toLocaleString()} 
              icon={Users}
              color="#3B82F6"
            />
            <StatCard 
              title="Total Customers" 
              value={stats.users.total_customers.toLocaleString()} 
              icon={Users}
              color="#8B5CF6"
            />
            <StatCard 
              title="New Users (7 days)" 
              value={stats.users.new_7days.toLocaleString()} 
              change={`+${stats.users.new_7days}`}
              changeType="up"
              icon={TrendingUp}
              color="#10B981"
            />
            <StatCard 
              title="New Users (30 days)" 
              value={stats.users.new_30days.toLocaleString()} 
              change={`+${stats.users.new_30days}`}
              changeType="up"
              icon={TrendingUp}
              color="#06B6D4"
            />
          </div>
        </div>

        {/* Handlers Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-orange-600" />
            Handlers Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Handlers" 
              value={stats.handlers.total.toLocaleString()} 
              icon={Briefcase}
              color="#F97316"
            />
            <StatCard 
              title="New Handlers (7 days)" 
              value={stats.handlers.new_7days.toLocaleString()} 
              change={`+${stats.handlers.new_7days}`}
              changeType="up"
              icon={TrendingUp}
              color="#10B981"
            />
            <StatCard 
              title="New Handlers (30 days)" 
              value={stats.handlers.new_30days.toLocaleString()} 
              change={`+${stats.handlers.new_30days}`}
              changeType="up"
              icon={TrendingUp}
              color="#06B6D4"
            />
          </div>
        </div>

        {/* Partners Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-green-600" />
            Partners Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard 
              title="Total Partners" 
              value={stats.partners.total.toLocaleString()} 
              icon={Building2}
              color="#10B981"
            />
            <StatCard 
              title="Approved" 
              value={stats.partners.approved.toLocaleString()} 
              icon={Activity}
              color="#22C55E"
            />
            <StatCard 
              title="Pending" 
              value={stats.partners.pending.toLocaleString()} 
              icon={Activity}
              color="#F59E0B"
            />
            <StatCard 
              title="New (7 days)" 
              value={stats.partners.new_7days.toLocaleString()} 
              change={`+${stats.partners.new_7days}`}
              changeType="up"
              icon={TrendingUp}
              color="#10B981"
            />
            <StatCard 
              title="New (30 days)" 
              value={stats.partners.new_30days.toLocaleString()} 
              change={`+${stats.partners.new_30days}`}
              changeType="up"
              icon={TrendingUp}
              color="#06B6D4"
            />
          </div>
        </div>

        {/* Gross Income Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-emerald-600" />
            Gross Income
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Payments Received" 
              value={`£${stats.revenue.total.toLocaleString()}`} 
              icon={DollarSign}
              color="#10B981"
            />
            <StatCard 
              title="Daily Earnings" 
              value={`£${stats.revenue.daily.toLocaleString()}`} 
              icon={TrendingUp}
              color="#22C55E"
            />
            <StatCard 
              title="Weekly Earnings" 
              value={`£${stats.revenue.weekly.toLocaleString()}`} 
              icon={TrendingUp}
              color="#16A34A"
            />
          </div>
        </div>

        {/* Bookings Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-purple-600" />
            Bookings Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Bookings (Yearly)" 
              value={stats.bookings.yearly.toLocaleString()} 
              icon={Calendar}
              color="#9333EA"
            />
            <StatCard 
              title="This Month" 
              value={stats.bookings.monthly.toLocaleString()} 
              icon={Calendar}
              color="#A855F7"
            />
            <StatCard 
              title="This Week" 
              value={stats.bookings.weekly.toLocaleString()} 
              icon={Calendar}
              color="#C084FC"
            />
            <StatCard 
              title="Today" 
              value={stats.bookings.today.toLocaleString()} 
              icon={Calendar}
              color="#D8B4FE"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <StatCard 
              title="Pending Bookings" 
              value={stats.bookings.pending.toLocaleString()} 
              icon={Activity}
              color="#F59E0B"
            />
            <StatCard 
              title="Active Bookings" 
              value={stats.bookings.active.toLocaleString()} 
              icon={Activity}
              color="#3B82F6"
            />
            <StatCard 
              title="Completed Bookings" 
              value={stats.bookings.completed.toLocaleString()} 
              icon={Activity}
              color="#10B981"
            />
          </div>
        </div>

        {/* Payouts Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-red-600" />
            Payouts Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Payout (Yearly)" 
              value={`£${stats.payouts.amount_yearly.toLocaleString()}`} 
              icon={CreditCard}
              color="#DC2626"
            />
            <StatCard 
              title="Total Payout (This Month)" 
              value={`£${stats.payouts.amount_monthly.toLocaleString()}`} 
              icon={CreditCard}
              color="#EF4444"
            />
            <StatCard 
              title="Total Payout (Today)" 
              value={`£${stats.payouts.amount_today.toLocaleString()}`} 
              icon={CreditCard}
              color="#F87171"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <StatCard 
              title="Payout Count (Yearly)" 
              value={stats.payouts.count_yearly.toLocaleString()} 
              icon={Activity}
              color="#DC2626"
            />
            <StatCard 
              title="Payout Count (Monthly)" 
              value={stats.payouts.count_monthly.toLocaleString()} 
              icon={Activity}
              color="#EF4444"
            />
            <StatCard 
              title="Payout Count (Today)" 
              value={stats.payouts.count_today.toLocaleString()} 
              icon={Activity}
              color="#F87171"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Users Management</h2><p className="text-gray-600 mt-2">Users management functionality coming soon...</p></div>;
      case 'handlers':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Handlers Management</h2><p className="text-gray-600 mt-2">Handlers management functionality coming soon...</p></div>;
      case 'partners':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Partners Management</h2><p className="text-gray-600 mt-2">Partners management functionality coming soon...</p></div>;
      case 'bookings':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Bookings Management</h2><p className="text-gray-600 mt-2">Bookings management functionality coming soon...</p></div>;
      case 'services':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Services Management</h2><p className="text-gray-600 mt-2">Services management functionality coming soon...</p></div>;
      case 'payments':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Payments Management</h2><p className="text-gray-600 mt-2">Payments management functionality coming soon...</p></div>;
      case 'company':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Company Settings</h2><p className="text-gray-600 mt-2">Company settings functionality coming soon...</p></div>;
      case 'stripe':
        return <div className="bg-white rounded-lg shadow p-6"><h2 className="text-2xl font-bold">Stripe Settings</h2><p className="text-gray-600 mt-2">Stripe settings functionality coming soon...</p></div>;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-orange-500">ExperTrait Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id, item.subItems)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors ${
                  activePage === item.id ? 'bg-orange-600 text-white' : 'text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </div>
                {sidebarOpen && item.subItems && (
                  expandedMenus[item.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {/* Sub-menu items */}
              {sidebarOpen && item.subItems && expandedMenus[item.id] && (
                <div className="bg-gray-800">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActivePage(subItem.id)}
                      className={`w-full flex items-center px-4 py-2 pl-12 hover:bg-gray-700 transition-colors text-sm ${
                        activePage === subItem.id ? 'bg-orange-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">© 2024 ExperTrait</p>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h2>
            <p className="text-sm text-gray-600">Manage your ExperTrait platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Admin Panel
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
}
