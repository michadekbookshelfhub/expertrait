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
