import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [handlers, setHandlers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHandlers: 0,
    activeHandlers: 0,
    totalBookings: 0,
    completedBookings: 0,
  });

  useEffect(() => {
    const savedPartner = localStorage.getItem('partner');
    if (!savedPartner) {
      navigate('/partner-login');
      return;
    }
    
    const partnerData = JSON.parse(savedPartner);
    setPartner(partnerData);
    loadDashboardData(partnerData.id);
  }, [navigate]);

  const loadDashboardData = async (partnerId) => {
    try {
      setLoading(true);
      
      // Load handlers
      const handlersRes = await fetch(`${API_URL}/api/partner/${partnerId}/handlers`);
      if (handlersRes.ok) {
        const handlersData = await handlersRes.json();
        setHandlers(handlersData.handlers || []);
        
        // Calculate stats
        const activeCount = handlersData.handlers.filter(h => h.status === 'active').length;
        setStats(prev => ({
          ...prev,
          totalHandlers: handlersData.handlers.length,
          activeHandlers: activeCount,
        }));
      }

      // Load bookings
      const bookingsRes = await fetch(`${API_URL}/api/partner/${partnerId}/bookings`);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
        
        const completedCount = bookingsData.bookings.filter(b => b.status === 'completed').length;
        setStats(prev => ({
          ...prev,
          totalBookings: bookingsData.bookings.length,
          completedBookings: completedCount,
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partner');
    navigate('/partner-login');
  };

  const renderOverview = () => (
    <div className="overview-section">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
            <span style={{ fontSize: '32px' }}>👥</span>
          </div>
          <div className="stat-details">
            <h3>{stats.totalHandlers}</h3>
            <p>Total Handlers</p>
            <span className="stat-subtext">{stats.activeHandlers} active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E3F2FD' }}>
            <span style={{ fontSize: '32px' }}>📋</span>
          </div>
          <div className="stat-details">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
            <span className="stat-subtext">{stats.completedBookings} completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FFF3E0' }}>
            <span style={{ fontSize: '32px' }}>⭐</span>
          </div>
          <div className="stat-details">
            <h3>{partner?.healthcare_category || 'Healthcare'}</h3>
            <p>Category</p>
            <span className="stat-subtext">Licensed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#F3E5F5' }}>
            <span style={{ fontSize: '32px' }}>✓</span>
          </div>
          <div className="stat-details">
            <h3>{partner?.status || 'approved'}</h3>
            <p>Account Status</p>
            <span className="stat-subtext">Active</span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Bookings</h3>
        <div className="activity-list">
          {bookings.slice(0, 5).map((booking, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">📅</div>
              <div className="activity-details">
                <p className="activity-title">{booking.service_name}</p>
                <p className="activity-time">
                  {booking.scheduled_date} • {booking.status}
                </p>
              </div>
              <span className={`status-badge status-${booking.status}`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHandlers = () => (
    <div className="handlers-section">
      <div className="section-header">
        <h2>Healthcare Workers</h2>
        <p className="section-subtitle">Manage handlers under your supervision</p>
      </div>

      {handlers.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>👥</span>
          <h3>No Handlers Assigned</h3>
          <p>Handlers will appear here once assigned by the admin</p>
        </div>
      ) : (
        <div className="handlers-grid">
          {handlers.map((handler) => (
            <div key={handler.id} className="handler-card">
              <div className="handler-avatar">
                {handler.name.charAt(0).toUpperCase()}
              </div>
              <div className="handler-info">
                <h3>{handler.name}</h3>
                <p className="handler-email">{handler.email}</p>
                <p className="handler-phone">{handler.phone}</p>
                <div className="handler-skills">
                  {handler.skills?.map((skill, idx) => (
                    <span key={idx} className="skill-badge">{skill}</span>
                  ))}
                </div>
                <div className="handler-stats">
                  <span>📋 {handler.total_jobs} jobs</span>
                  <span className={`status-badge status-${handler.status}`}>
                    {handler.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="bookings-section">
      <div className="section-header">
        <h2>Bookings Supervision</h2>
        <p className="section-subtitle">Monitor all healthcare bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>📋</span>
          <h3>No Bookings Yet</h3>
          <p>Bookings for your handlers will appear here</p>
        </div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Handler</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.service_name}</strong>
                    <br />
                    <small>{booking.service_category}</small>
                  </td>
                  <td>{booking.handler_id ? 'Assigned' : 'Pending'}</td>
                  <td>{booking.scheduled_date || 'Not set'}</td>
                  <td>
                    {booking.time_range_start && booking.time_range_end
                      ? `${booking.time_range_start} - ${booking.time_range_end}`
                      : 'Not set'}
                  </td>
                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>£{booking.service_price?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="profile-section">
      <h2>Partner Profile</h2>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {partner?.organization_name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{partner?.organization_name}</h2>
            <p>{partner?.healthcare_category}</p>
            <span className={`status-badge status-${partner?.status}`}>
              {partner?.status}
            </span>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">Contact Person</span>
            <span className="detail-value">{partner?.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{partner?.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{partner?.phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address</span>
            <span className="detail-value">{partner?.address}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">License Number</span>
            <span className="detail-value">{partner?.license_number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">
              {partner?.created_at ? new Date(partner.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="partner-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>🏥 ExperTrait Partner</h1>
        </div>
        <div className="nav-user">
          <span>{partner?.organization_name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'handlers' ? 'active' : ''}`}
            onClick={() => setActiveTab('handlers')}
          >
            👥 Healthcare Workers
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📋 Bookings
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            ⚙️ Profile
          </button>
        </aside>

        <main className="dashboard-main">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'handlers' && renderHandlers()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'profile' && renderProfile()}
        </main>
      </div>

      <style>{`
        .partner-dashboard {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .dashboard-nav {
          background: #fff;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .nav-brand h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #4CAF50;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logout-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .logout-btn:hover {
          background: #d32f2f;
        }

        .dashboard-container {
          display: flex;
          max-width: 1400px;
          margin: 2rem auto;
          gap: 2rem;
          padding: 0 2rem;
        }

        .dashboard-sidebar {
          width: 250px;
          background: #fff;
          border-radius: 8px;
          padding: 1rem;
          height: fit-content;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .sidebar-btn {
          width: 100%;
          text-align: left;
          padding: 1rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .sidebar-btn:hover {
          background: #f5f5f5;
        }

        .sidebar-btn.active {
          background: #4CAF50;
          color: white;
        }

        .dashboard-main {
          flex: 1;
          background: #fff;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .section-subtitle {
          color: #666;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-details h3 {
          margin: 0;
          font-size: 2rem;
          color: #333;
        }

        .stat-details p {
          margin: 0.25rem 0;
          color: #666;
        }

        .stat-subtext {
          font-size: 0.875rem;
          color: #999;
        }

        .recent-activity {
          margin-top: 2rem;
        }

        .recent-activity h3 {
          margin-bottom: 1rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f8f8;
          border-radius: 8px;
        }

        .activity-icon {
          font-size: 2rem;
        }

        .activity-details {
          flex: 1;
        }

        .activity-title {
          margin: 0;
          font-weight: 600;
          color: #333;
        }

        .activity-time {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #666;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending { background: #FFF3E0; color: #F57C00; }
        .status-accepted { background: #E3F2FD; color: #1976D2; }
        .status-in_progress { background: #F3E5F5; color: #7B1FA2; }
        .status-completed { background: #E8F5E9; color: #2E7D32; }
        .status-cancelled { background: #FFEBEE; color: #C62828; }
        .status-active { background: #E8F5E9; color: #2E7D32; }
        .status-approved { background: #E8F5E9; color: #2E7D32; }

        .handlers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .handler-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .handler-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #4CAF50;
          color: white;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .handler-info h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .handler-email, .handler-phone {
          margin: 0.25rem 0;
          color: #666;
          font-size: 0.875rem;
        }

        .handler-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin: 1rem 0;
        }

        .skill-badge {
          background: #E8F5E9;
          color: #2E7D32;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .handler-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .bookings-table {
          overflow-x: auto;
        }

        .bookings-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .bookings-table th {
          background: #f5f5f5;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
        }

        .bookings-table td {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .bookings-table tr:hover {
          background: #f8f8f8;
        }

        .profile-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
        }

        .profile-header {
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          padding: 2rem;
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .profile-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: white;
          color: #4CAF50;
          font-size: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .profile-info h2 {
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .profile-info p {
          margin: 0 0 0.5rem 0;
          color: rgba(255,255,255,0.9);
        }

        .profile-details {
          padding: 2rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
        }

        .detail-value {
          color: #333;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #999;
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem 0;
          color: #666;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            flex-direction: column;
          }

          .dashboard-sidebar {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .handlers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerDashboard;
