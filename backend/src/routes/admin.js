import { Router } from 'express'
import { User } from '../models/User.js'
import { NgoProfile } from '../models/NgoProfile.js'
import { Donation } from '../models/Donation.js'
import { DonationRequest } from '../models/DonationRequest.js'
import { authenticate, allow } from '../middleware/auth.js'
import { asyncHandler } from '../utils/AppError.js'
const router = Router(); router.use(authenticate, allow('ADMIN'))
router.get('/dashboard', asyncHandler(async (req, res) => { const [users, donors, ngos, pendingNgos, donations, active, completed, quantity, recent] = await Promise.all([User.countDocuments(), User.countDocuments({ role: 'DONOR' }), User.countDocuments({ role: 'NGO' }), NgoProfile.countDocuments({ verificationStatus: 'PENDING' }), Donation.countDocuments(), Donation.countDocuments({ status: { $in: ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKUP_SCHEDULED'] } }), Donation.countDocuments({ status: 'DISTRIBUTED' }), Donation.aggregate([{ $match: { status: 'DISTRIBUTED' } }, { $group: { _id: null, total: { $sum: '$allocatedQuantity' } } }]), Donation.find().populate('donor', 'name').sort({ createdAt: -1 }).limit(5)]); res.json({ success: true, data: { users, donors, ngos, pendingNgos, donations, active, completed, totalQuantity: quantity[0]?.total || 0, recent } }) }))
router.get('/reports', asyncHandler(async (req, res) => { const [categories, monthly, ngoParticipation, donorParticipation] = await Promise.all([Donation.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, quantity: { $sum: '$quantity' } } }]), Donation.aggregate([{ $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, donations: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }]), DonationRequest.aggregate([{ $group: { _id: '$ngo', requests: { $sum: 1 } } }, { $sort: { requests: -1 } }, { $limit: 10 }]), Donation.aggregate([{ $group: { _id: '$donor', donations: { $sum: 1 } } }, { $sort: { donations: -1 } }, { $limit: 10 }])]); res.json({ success: true, data: { categories, monthly, ngoParticipation, donorParticipation } }) }))
router.get('/donations', asyncHandler(async (req, res) => { const items = await Donation.find().populate('donor', 'name email').sort({ createdAt: -1 }); res.json({ success: true, data: items }) }))
router.get('/requests', asyncHandler(async (req, res) => { const items = await DonationRequest.find().populate('donation', 'foodName status').populate('ngo', 'name email').sort({ createdAt: -1 }); res.json({ success: true, data: items }) }))
export default router
