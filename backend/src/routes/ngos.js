import { Router } from 'express'
import { NgoProfile } from '../models/NgoProfile.js'
import { authenticate, allow } from '../middleware/auth.js'
import { AppError, asyncHandler } from '../utils/AppError.js'
const router = Router(); router.use(authenticate)
router.get('/', allow('ADMIN'), asyncHandler(async (req, res) => { const profiles = await NgoProfile.find().populate('user', 'name email phone isActive').sort({ createdAt: -1 }); res.json({ success: true, data: profiles }) }))
router.get('/pending', allow('ADMIN'), asyncHandler(async (req, res) => { const profiles = await NgoProfile.find({ verificationStatus: 'PENDING' }).populate('user', 'name email phone').sort({ createdAt: 1 }); res.json({ success: true, data: profiles }) }))
router.patch('/:id/verification', allow('ADMIN'), asyncHandler(async (req, res) => { const { status, note } = req.body; if (!['VERIFIED', 'REJECTED'].includes(status)) throw new AppError('Verification status must be VERIFIED or REJECTED.'); const profile = await NgoProfile.findByIdAndUpdate(req.params.id, { verificationStatus: status, verificationNote: note }, { new: true }).populate('user', 'name email'); if (!profile) throw new AppError('NGO profile not found.', 404); res.json({ success: true, message: `NGO ${status.toLowerCase()}.`, data: profile }) }))
export default router
