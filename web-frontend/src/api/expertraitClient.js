// ExperTrait Backend Client
const API_URL = 'https://homeservices-app.preview.emergentagent.com/api';

export const expertraitClient = {
  // Services
  services: {
    list: async (sort = '', limit = 100) => {
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      let data = await response.json();
      
      // Sort if needed
      if (sort === '-created_date') {
        data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      // Limit results
      if (limit) {
        data = data.slice(0, limit);
      }
      
      return data;
    },
    
    get: async (id) => {
      const response = await fetch(`${API_URL}/services/${id}`);
      if (!response.ok) throw new Error('Failed to fetch service');
      return response.json();
    },
  },
  
  // Categories
  categories: {
    list: async () => {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories || [];
    },
  },
  
  // Bookings
  bookings: {
    create: async (bookingData) => {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) throw new Error('Failed to create booking');
      return response.json();
    },
    
    list: async (customerId) => {
      const response = await fetch(`${API_URL}/bookings/customer/${customerId}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
  },
  
  // Auth
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('expertrait_user', JSON.stringify(data.user));
      }
      return data.user;
    },
    
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Registration failed');
      const data = await response.json();
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('expertrait_user', JSON.stringify(data));
      }
      return data;
    },
    
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('expertrait_user');
      }
    },
    
    getCurrentUser: () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('expertrait_user');
        return user ? JSON.parse(user) : null;
      }
      return null;
    },
  },
};
