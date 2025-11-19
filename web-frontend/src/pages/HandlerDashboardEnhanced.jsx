import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, DollarSign, User, LogOut, Package, TrendingUp, CheckCircle, Search, Download, X, MessageCircle, AlertCircle, Calendar, MapPin } from 'lucide-react';

export default function HandlerDashboardNew() {
  const [handler, setHandler] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [available, setAvailable] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadHandlerData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const loadHandlerData = async () => {
    try {
      const handlerId = localStorage.getItem('user_id');
      const handlerEmail = localStorage.getItem('user_email');
      
      if (!handlerId) {
        window.location.href = '/';
        return;
      }

      setHandler({ id: handlerId, email: handlerEmail });

      const bookingsResponse = await fetch(`/api/bookings/professional/${handlerId}`);
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData.bookings || []);

      const walletResponse = await fetch(`/api/handler/${handlerId}/wallet`);
      const walletData = await walletResponse.json();
      setWallet(walletData);

    } catch (error) {
      console.error('Error loading handler data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.service_date);
        if (dateFilter === 'upcoming') {
          return bookingDate > now;
        } else if (dateFilter === 'past') {
          return bookingDate < now;
        } else if (dateFilter === 'today') {
          return bookingDate.toDateString() === now.toDateString();
        }
        return true;
      });
    }

    setFilteredBookings(filtered);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Service', 'Customer', 'Date', 'Time', 'Status', 'Payment'];
    const rows = filteredBookings.map(booking => [
      booking.id?.slice(-8) || 'N/A',
      booking.service_name || 'N/A',
      booking.customer_name || 'N/A',
      new Date(booking.service_date).toLocaleDateString(),
      new Date(booking.service_date).toLocaleTimeString(),
      booking.status,
      `£${booking.price || '0.00'}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handler-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.pending;
  };

  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleAcceptBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        alert('Booking accepted successfully');
        closeModal();
        loadHandlerData();
      } else {
        alert('Failed to accept booking');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking');
    }
  };

  const handleCompleteBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        alert('Booking marked as completed');
        closeModal();
        loadHandlerData();
      } else {
        alert('Failed to complete booking');
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Failed to complete booking');
    }
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
              {/* Filters */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by service, customer, or job ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {filteredBookings.length} {filteredBookings.length === 1 ? 'job' : 'jobs'} found
                  </p>
                  <button
                    onClick={exportToCSV}
                    disabled={filteredBookings.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
              
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {bookings.length === 0 ? 'No jobs yet' : 'No jobs match your filters'}
                  </h3>
                  <p className="text-gray-600">
                    {bookings.length === 0 ? 'Jobs will appear here when customers book your services' : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 hover:border-green-600 transition-colors cursor-pointer"
                      onClick={() => openBookingModal(booking)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.service_name || 'Service'}
                          </h3>
                          <p className="text-sm text-gray-600">#{booking.id?.slice(-8)}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
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
                          {new Date(booking.service_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  {selectedBooking.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedBooking.service_name || 'Service'}
                  </h3>
                  <p className="text-sm text-gray-600">Job ID: #{selectedBooking.id?.slice(-8)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBooking.service_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBooking.service_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium text-gray-900">{selectedBooking.customer_name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{selectedBooking.address || 'Address not set'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Payment</p>
                  <p className="text-2xl font-bold text-green-600">£{selectedBooking.price || '0.00'}</p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-3">
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={handleAcceptBooking}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Start Job
                  </button>
                )}

                {selectedBooking.status === 'in_progress' && (
                  <button
                    onClick={handleCompleteBooking}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Completed
                  </button>
                )}

                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Customer
                </button>

                <button
                  onClick={closeModal}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
