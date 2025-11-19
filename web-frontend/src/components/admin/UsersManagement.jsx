import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, UserX, UserCheck, Eye, Calendar, Mail, Phone, MapPin } from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, statusFilter, typeFilter]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === typeFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!confirm(`Are you sure you want to ${newStatus} this user?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`User ${newStatus} successfully`);
        loadUsers();
        setShowModal(false);
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('User deleted successfully');
        loadUsers();
        setShowModal(false);
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const openUserModal = async (user) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`);
      const data = await response.json();
      setSelectedUser(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status] || colors.active;
  };

  const getUserTypeBadge = (type) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      partner: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || colors.customer;
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
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <p className="text-gray-600 mt-1">Manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="customer">Customers</option>
              <option value="professional">Professionals</option>
              <option value="partner">Partners</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeBadge(user.user_type)}`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(user.status || 'active')}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openUserModal(user)}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(user.id, 'suspended')}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        <UserX className="w-4 h-4 inline" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <UserCheck className="w-4 h-4 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeBadge(selectedUser.user_type)}`}>
                      {selectedUser.user_type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">Phone</span>
                    </div>
                    <p className="text-sm text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Joined</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(selectedUser.status || 'active')}`}>
                      {selectedUser.status || 'active'}
                    </span>
                  </div>
                </div>

                {selectedUser.address && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <p className="text-sm text-gray-900">{selectedUser.address}</p>
                  </div>
                )}

                {selectedUser.user_type === 'professional' && selectedUser.skills && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="text-sm font-medium">Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold text-gray-900">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-lg font-semibold">{selectedUser.total_bookings || 0}</p>
                    </div>
                    {selectedUser.user_type === 'professional' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-lg font-semibold">{selectedUser.rating?.toFixed(1) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Earnings</p>
                          <p className="text-lg font-semibold">£{selectedUser.total_earnings?.toFixed(2) || '0.00'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t flex gap-3">
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Activate User
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
