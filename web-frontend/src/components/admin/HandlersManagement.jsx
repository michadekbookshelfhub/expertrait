import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Eye, Star, Briefcase } from 'lucide-react';

export default function HandlersManagement() {
  const [handlers, setHandlers] = useState([]);
  const [filteredHandlers, setFilteredHandlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadHandlers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [handlers, searchTerm, statusFilter]);

  const loadHandlers = async () => {
    try {
      const response = await fetch('/api/handlers');
      const data = await response.json();
      setHandlers(data.handlers || []);
    } catch (error) {
      console.error('Error loading handlers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...handlers];

    if (searchTerm) {
      filtered = filtered.filter(handler => 
        handler.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handler.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(handler => {
        if (statusFilter === 'available') return handler.available;
        if (statusFilter === 'unavailable') return !handler.available;
        return true;
      });
    }

    setFilteredHandlers(filtered);
  };

  const toggleAvailability = async (handlerId, currentStatus) => {
    try {
      const response = await fetch(`/api/handlers/${handlerId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (response.ok) {
        alert('Handler availability updated');
        loadHandlers();
      }
    } catch (error) {
      console.error('Error updating handler:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Handlers Management</h2>
        <p className="text-gray-600 mt-1">Manage professional service handlers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search handlers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Handlers</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            {filteredHandlers.length} handler{filteredHandlers.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Handlers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHandlers.map((handler) => (
          <div key={handler.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">
                    {handler.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{handler.name}</h3>
                  <p className="text-sm text-gray-600">{handler.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  handler.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {handler.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rating:</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{handler.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Jobs:</span>
                <span className="font-medium">{handler.total_bookings || 0}</span>
              </div>
            </div>

            {handler.skills && handler.skills.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {handler.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {handler.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{handler.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => toggleAvailability(handler.id, handler.available)}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              {handler.available ? 'Set Unavailable' : 'Set Available'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
