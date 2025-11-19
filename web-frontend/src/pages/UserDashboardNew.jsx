import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, CreditCard, User, Settings, LogOut, Package } from 'lucide-react';

export default function UserDashboardNew() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Check if user is logged in via localStorage
      const userId = localStorage.getItem('user_id');
      const userEmail = localStorage.getItem('user_email');
      
      if (!userId) {
        window.location.href = '/';
        return;
      }

      setUser({ id: userId, email: userEmail });

      // Load bookings
      const response = await fetch(`/api/bookings/user/${userId}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'bookings'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'bookings' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Start booking services to see them here</p>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Browse Services
                </a>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.service_name || 'Service'}
                        </h3>
                        <p className="text-sm text-gray-600">#{booking.id?.slice(-8)}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.service_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(booking.service_date).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{booking.address || 'Address not set'}</span>
                      </div>
                    </div>

                    {booking.handler_name && (
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>Handler: {booking.handler_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-green-600">
                          <CreditCard className="w-5 h-5" />
                          <span>£{booking.price || '0.00'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <input
                  type="text"
                  value="Customer"
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <p className="text-sm text-gray-600">
                To update your profile, please use the ExperTrait mobile app.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
