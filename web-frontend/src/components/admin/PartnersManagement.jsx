import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Building2 } from 'lucide-react';

export default function PartnersManagement() {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [partners, searchTerm]);

  const loadPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...partners];

    if (searchTerm) {
      filtered = filtered.filter(partner => 
        partner.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPartners(filtered);
  };

  const handleApproval = async (partnerId, status) => {
    if (!confirm(`Are you sure you want to ${status} this partner?`)) return;

    try {
      const response = await fetch(`/api/admin/partners/${partnerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Partner ${status} successfully`);
        loadPartners();
      } else {
        alert('Failed to update partner status');
      }
    } catch (error) {
      console.error('Error updating partner:', error);
      alert('Failed to update partner status');
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
        <h2 className="text-2xl font-bold text-gray-900">Partners Management</h2>
        <p className="text-gray-600 mt-1">Manage healthcare partner organizations</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPartners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {partner.organization_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{partner.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  partner.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : partner.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {partner.status || 'pending'}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{partner.healthcare_category || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Representative:</span>
                <span className="font-medium">{partner.representative_full_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{partner.company_phone || 'N/A'}</span>
              </div>
            </div>

            {partner.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproval(partner.id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(partner.id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
