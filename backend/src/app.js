import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import donationRoutes from './routes/donations.js'
import requestRoutes from './routes/requests.js'
import userRoutes from './routes/users.js'
import ngoRoutes from './routes/ngos.js'
import adminRoutes from './routes/admin.js'
import { errorHandler, notFound } from './middleware/error.js'
const app = express()
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' })); app.use(morgan('dev'))
app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }))
app.use('/api/auth', authRoutes); app.use('/api/donations', donationRoutes); app.use('/api/donation-requests', requestRoutes); app.use('/api/users', userRoutes); app.use('/api/ngos', ngoRoutes); app.use('/api/admin', adminRoutes)
app.use(notFound); app.use(errorHandler)
export default app
