import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from './config/db.js'
import { User } from './models/User.js'
import { NgoProfile } from './models/NgoProfile.js'
import { Donation } from './models/Donation.js'
import { DonationRequest } from './models/DonationRequest.js'
import { DonationStatusHistory } from './models/DonationStatusHistory.js'
import { Notification } from './models/Notification.js'
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be configured.')
await connectDatabase(process.env.MONGODB_URI)
await Promise.all([User.deleteMany({}), NgoProfile.deleteMany({}), Donation.deleteMany({}), DonationRequest.deleteMany({}), DonationStatusHistory.deleteMany({}), Notification.deleteMany({})])
const [admin, donor1, donor2, ngo1, ngo2, ngo3] = await User.create([
  { name: 'Aarav Admin', email: 'admin@smartbite.demo', password: 'Admin@123', role: 'ADMIN', phone: '9000000001' },
  { name: 'Meera Kitchens', email: 'meera@smartbite.demo', password: 'Donor@123', role: 'DONOR', phone: '9000000002' },
  { name: 'Rahul Bakery', email: 'rahul@smartbite.demo', password: 'Donor@123', role: 'DONOR', phone: '9000000003' },
  { name: 'Ananya Hope Foundation', email: 'ananya@smartbite.demo', password: 'Ngo@12345', role: 'NGO', phone: '9000000004' },
  { name: 'River Relief Trust', email: 'river@smartbite.demo', password: 'Ngo@12345', role: 'NGO', phone: '9000000005' },
  { name: 'Community Care Network', email: 'community@smartbite.demo', password: 'Ngo@12345', role: 'NGO', phone: '9000000006' }
])
await NgoProfile.create([{ user: ngo1, ngoName: 'Hope Foundation', contactPerson: 'Ananya Rao', address: '21 Lake Road, Bengaluru', registrationNumber: 'KA/NGO/2021/184', description: 'Community meal support.', verificationStatus: 'VERIFIED' }, { user: ngo2, ngoName: 'River Relief Trust', contactPerson: 'Kabir Sen', address: '4 River Street, Bengaluru', registrationNumber: 'KA/NGO/2020/090', description: 'Emergency food outreach.', verificationStatus: 'PENDING' }, { user: ngo3, ngoName: 'Community Care Network', contactPerson: 'Nisha Thomas', address: '82 Market Road, Bengaluru', registrationNumber: 'KA/NGO/2018/301', description: 'Shelter food programme.', verificationStatus: 'REJECTED' }])
const future = (hours) => new Date(Date.now() + hours * 3600000)
const [available, requested, distributed] = await Donation.create([{ donor: donor1, foodName: 'Vegetable pulao meals', category: 'COOKED_MEAL', description: 'Freshly prepared vegetarian meal boxes from an event.', quantity: 40, quantityUnit: 'SERVINGS', foodType: 'VEGETARIAN', preparationDate: new Date(), expiresAt: future(6), pickupAddress: '12 Residency Road, Bengaluru', pickupWindow: 'Today, 6:00–8:00 PM', status: 'AVAILABLE' }, { donor: donor2, foodName: 'Assorted bread and buns', category: 'BAKERY', description: 'Same-day bakery products, securely packed.', quantity: 25, quantityUnit: 'PACKETS', foodType: 'VEGETARIAN', expiresAt: future(12), pickupAddress: '8 Church Street, Bengaluru', pickupWindow: 'Tomorrow, 9:00–11:00 AM', status: 'REQUESTED' }, { donor: donor1, foodName: 'Community lunch servings', category: 'COOKED_MEAL', description: 'Completed historical distribution.', quantity: 60, allocatedQuantity: 60, quantityUnit: 'SERVINGS', foodType: 'VEGETARIAN', expiresAt: future(1), pickupAddress: '12 Residency Road, Bengaluru', pickupWindow: 'Completed', status: 'DISTRIBUTED' }])
const req1 = await DonationRequest.create({ donation: requested, ngo: ngo1, requestedQuantity: 20, status: 'PENDING', note: 'For evening shelter service.' })
const req2 = await DonationRequest.create({ donation: distributed, ngo: ngo1, requestedQuantity: 60, status: 'DISTRIBUTED', pickupSchedule: '2026-11-04, 3:00 PM', collectedAt: new Date(Date.now() - 86400000), distributedAt: new Date() })
distributed.assignedRequest = req2._id; await distributed.save()
await DonationStatusHistory.create([{ donation: available, status: 'AVAILABLE', changedBy: donor1 }, { donation: requested, request: req1, status: 'REQUESTED', changedBy: ngo1 }, { donation: distributed, request: req2, status: 'DISTRIBUTED', changedBy: ngo1 }])
await Notification.create({ recipient: ngo1, title: 'Demo request pending', message: 'Your bakery donation request is awaiting a donor response.' })
console.log('Demo data seeded.'); await mongoose.disconnect()
