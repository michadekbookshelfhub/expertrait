import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, DollarSign, User, LogOut, Package, TrendingUp, CheckCircle } from 'lucide-react';

export default function HandlerDashboardNew() {
  const [handler, setHandler] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    loadHandlerData();
  }, []);

  const loadHandlerData = async () => {
    try {
      const handlerId = localStorage.getItem('user_id');
      const handlerEmail = localStorage.getItem('user_email');
      
      if (!handlerId) {
        window.location.href = '/';
        return;
      }

      setHandler({ id: handlerId, email: handlerEmail });

      // Load bookings
      const bookingsResponse = await fetch(`/api/bookings/professional/${handlerId}`);
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData.bookings || []);

      // Load wallet
      const walletResponse = await fetch(`/api/handler/${handlerId}/wallet`);
      const walletData = await walletResponse.json();
      setWallet(walletData);

    } catch (error) {
      console.error('Error loading handler data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`/api/professionals/${handler.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !available })
      });
      if (response.ok) {
        setAvailable(!available);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Handler Dashboard</h1>
              <p className="text-sm text-gray-600">{handler?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  available
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {available ? 'Available' : 'Unavailable'}
              </button>
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
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Briefcase className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{wallet?.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg border-b">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'jobs'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Jobs
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'earnings'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-sm p-6">
          {activeTab === 'jobs' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Jobs</h2>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
                  <p className="text-gray-600">Jobs will appear here when customers book your services</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 hover:border-green-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
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

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Customer:</span> {booking.customer_name || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(booking.service_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span>{' '}
                          {new Date(booking.service_date).toLocaleTimeString()}
                        </div>
                        <div>
                          <span className="font-medium">Payment:</span>{' '}
                          <span className="text-green-600 font-bold">£{booking.price || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">Total Earnings</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    £{wallet?.total_earnings?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800 font-medium">Current Balance</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    £{wallet?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <p className="text-sm text-purple-800 font-medium">Completed Jobs</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                For payout management and detailed earnings history, please use the ExperTrait mobile app.
              </p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={handler?.email || ''}
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
                    value="Professional Handler"
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  To update your profile, skills, and availability settings, please use the ExperTrait mobile app.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
