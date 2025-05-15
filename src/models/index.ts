import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

// Import all models
import User from './User'
import Url from './Url'

// Initialize connection
connectDB()

// Export all models
export {
  User,
  Url
}

// Export connection helpers
export const isConnected = () => mongoose.connection.readyState === 1
