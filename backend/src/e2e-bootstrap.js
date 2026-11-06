import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from './config/db.js'
import { User } from './models/User.js'

const email = 'e2e-admin@smartbite.test'
const password = 'SmartBiteE2E!2026'

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from backend/.env')
await connectDatabase(process.env.MONGODB_URI)
let admin = await User.findOne({ email })
if (!admin) {
  admin = await User.create({ name: 'SmartBite E2E Admin', email, password, role: 'ADMIN', phone: '9000000999' })
  console.log('Created dedicated E2E administrator account.')
} else {
  console.log('Dedicated E2E administrator account already exists.')
}
await mongoose.disconnect()
