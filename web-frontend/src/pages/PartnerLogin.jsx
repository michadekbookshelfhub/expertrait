import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    // Registration fields
    name: '',
    organization_name: '',
    license_number: '',
    phone: '',
    address: '',
    healthcare_category: 'Baby Sitter',
  });

  const HEALTHCARE_CATEGORIES = [
    'Baby Sitter',
    'Dog Sitter',
    'Mental Support Worker',
    'Domiciliary Care Worker',
    'Support Worker (Sit-in)'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/partner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const partnerData = await response.json();
        localStorage.setItem('partner', JSON.stringify(partnerData));
        navigate('/partner-dashboard');
      } else {
        const error = await response.json();
        alert(error.detail || 'Login failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/partner/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Registration submitted! Please wait for admin approval. You will receive an email confirmation.');
        setIsLogin(true);
        setFormData({ ...formData, name: '', organization_name: '', license_number: '', phone: '', address: '' });
      } else {
        const error = await response.json();
        alert(error.detail || 'Registration failed');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🏥 ExperTrait Partner Portal</h1>
          <p>Healthcare Provider Management System</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="partner@organization.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="form-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleInputChange}
                  placeholder="Healthcare Services Ltd"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="partner@organization.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+44 20 1234 5678"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label>Healthcare Category *</label>
              <select
                name="healthcare_category"
                value={formData.healthcare_category}
                onChange={handleInputChange}
                required
              >
                {HEALTHCARE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>License Number *</label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                placeholder="HC123456"
                required
              />
            </div>

            <div className="form-group">
              <label>Business Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Healthcare Street, London, UK"
                rows={3}
                required
              />
            </div>

            <div className="info-box">
              <p><strong>⚠️ Important:</strong> Your registration will be reviewed by our admin team. You'll receive an email notification once approved.</p>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Register as Partner'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>Need help? Contact <a href="mailto:partners@expertrait.com">partners@expertrait.com</a></p>
        </div>
      </div>

      <style>{`
        .partner-login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          width: 100%;
          overflow: hidden;
        }

        .login-header {
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .login-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .login-header p {
          margin: 0;
          opacity: 0.9;
        }

        .login-tabs {
          display: flex;
          border-bottom: 2px solid #e0e0e0;
        }

        .tab {
          flex: 1;
          padding: 1rem;
          border: none;
          background: none;
          font-size: 1rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab.active {
          color: #4CAF50;
          border-bottom: 3px solid #4CAF50;
        }

        .login-form {
          padding: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .info-box {
          background: #E3F2FD;
          border-left: 4px solid #2196F3;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 4px;
        }

        .info-box p {
          margin: 0;
          color: #1976D2;
          font-size: 0.875rem;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #45a049;
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .login-footer {
          padding: 1.5rem;
          text-align: center;
          background: #f5f5f5;
          border-top: 1px solid #e0e0e0;
        }

        .login-footer p {
          margin: 0;
          color: #666;
          font-size: 0.875rem;
        }

        .login-footer a {
          color: #4CAF50;
          text-decoration: none;
          font-weight: 600;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .login-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerLogin;
