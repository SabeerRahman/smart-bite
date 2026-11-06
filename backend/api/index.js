import app from '../src/app.js'
import { connectDatabase } from '../src/config/db.js'

// Vercel invokes this handler directly, so server.js is not involved.
// Mongoose reuses its established connection on warm function invocations.
export default async function handler(req, res) {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ success: false, message: 'Database configuration is unavailable.' })
  }
  try {
    await connectDatabase(process.env.MONGODB_URI)
    return app(req, res)
  } catch (error) {
    console.error('Database connection failed:', error.message)
    return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable.' })
  }
}
