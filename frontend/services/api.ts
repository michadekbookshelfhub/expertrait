const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = {
  // Services
  getServices: async (category?: string) => {
    const url = category
      ? `${API_URL}/api/services?category=${category}`
      : `${API_URL}/api/services`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_URL}/api/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Bookings
  createBooking: async (bookingData: any) => {
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  getCustomerBookings: async (customerId: string) => {
    const response = await fetch(`${API_URL}/api/bookings/customer/${customerId}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  getProfessionalBookings: async (professionalId: string) => {
    const response = await fetch(`${API_URL}/api/bookings/professional/${professionalId}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  getPendingBookings: async () => {
    const response = await fetch(`${API_URL}/api/bookings/pending`);
    if (!response.ok) throw new Error('Failed to fetch pending bookings');
    return response.json();
  },

  updateBooking: async (bookingId: string, updates: any) => {
    const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return response.json();
  },

  // Professionals
  updateProfessionalLocation: async (professionalId: string, latitude: number, longitude: number) => {
    const response = await fetch(`${API_URL}/api/professionals/${professionalId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professional_id: professionalId, latitude, longitude }),
    });
    if (!response.ok) throw new Error('Failed to update location');
    return response.json();
  },

  updateAvailability: async (professionalId: string, available: boolean) => {
    const response = await fetch(`${API_URL}/api/professionals/${professionalId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available }),
    });
    if (!response.ok) throw new Error('Failed to update availability');
    return response.json();
  },

  // Reviews
  createReview: async (reviewData: any) => {
    const response = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  },

  getProfessionalReviews: async (professionalId: string) => {
    const response = await fetch(`${API_URL}/api/reviews/professional/${professionalId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  // Payments
  createCheckoutSession: async (bookingId: string, originUrl: string) => {
    const response = await fetch(`${API_URL}/api/checkout/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, origin_url: originUrl }),
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    return response.json();
  },

  getCheckoutStatus: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/api/checkout/status/${sessionId}`);
    if (!response.ok) throw new Error('Failed to get checkout status');
    return response.json();
  },

  // AI Recommendations
  getRecommendations: async (customerId: string) => {
    const response = await fetch(`${API_URL}/api/recommendations/${customerId}`);
    if (!response.ok) throw new Error('Failed to get recommendations');
    return response.json();
  },
};