import { expertraitClient } from "./expertraitClient";

// Service Entity
export const Service = {
  list: (sort, limit) => expertraitClient.services.list(sort, limit),
  get: (id) => expertraitClient.services.get(id),
};

// Category Entity
export const Category = {
  list: () => expertraitClient.categories.list(),
};

// User Entity
export const User = {
  login: (email, password) => expertraitClient.auth.login(email, password),
  register: (userData) => expertraitClient.auth.register(userData),
  logout: () => expertraitClient.auth.logout(),
  getCurrentUser: () => expertraitClient.auth.getCurrentUser(),
};

// Booking Entity
export const Booking = {
  create: (data) => expertraitClient.bookings.create(data),
  list: (customerId) => expertraitClient.bookings.list(customerId),
};

// BlogPost Entity (mock for now)
export const BlogPost = {
  list: async () => {
    // Return mock blog posts
    return [
      {
        id: '1',
        title: 'Top 10 Home Maintenance Tips',
        excerpt: 'Keep your home in top shape with these essential maintenance tips',
        category: 'Tips',
        date: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      },
      {
        id: '2',
        title: 'How to Choose the Right Professional',
        excerpt: 'Guide to selecting the perfect service provider for your needs',
        category: 'Guides',
        date: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1581578017093-cd30006b29d8?w=800',
      },
    ];
  },
  get: async (id) => {
    return {
      id,
      title: 'Sample Blog Post',
      content: 'This is sample content',
      category: 'Tips',
      date: new Date().toISOString(),
    };
  },
};
