import { base44 } from './base44Client';


export const getUserBookings = base44.functions.getUserBookings;

export const getProviderJobs = base44.functions.getProviderJobs;

export const getAvailableJobs = base44.functions.getAvailableJobs;

export const getProviderStats = base44.functions.getProviderStats;

export const acceptJob = base44.functions.acceptJob;

export const updateBookingStatus = base44.functions.updateBookingStatus;

export const syncUserToMongo = base44.functions.syncUserToMongo;

export const checkUserRole = base44.functions.checkUserRole;

export const testMongoConnection = base44.functions.testMongoConnection;

export const diagnoseConnection = base44.functions.diagnoseConnection;

export const syncUserOnLogin = base44.functions.syncUserOnLogin;

