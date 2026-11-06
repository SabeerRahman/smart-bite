import { Router } from 'express'
import { User } from '../models/User.js'
import { NgoProfile } from '../models/NgoProfile.js'
import { authenticate, allow } from '../middleware/auth.js'
import { AppError, asyncHandler } from '../utils/AppError.js'
const router = Router()
router.use(authenticate)
router.get('/', allow('ADMIN'), asyncHandler(async (req, res) => { const { role, search, page = 1, limit = 20 } = req.query; const filter = {}; if (role) filter.role = role; if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }]; const [items, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)), User.countDocuments(filter)]); res.json({ success: true, data: { items, total } }) }))
router.get('/:id', asyncHandler(async (req, res) => { if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) throw new AppError('Not permitted.', 403); const user = await User.findById(req.params.id); if (!user) throw new AppError('User not found.', 404); const ngoProfile = user.role === 'NGO' ? await NgoProfile.findOne({ user: user._id }) : null; res.json({ success: true, data: { user: user.publicProfile(), ngoProfile } }) }))
router.patch('/:id', asyncHandler(async (req, res) => { if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) throw new AppError('Not permitted.', 403); const allowedFields = req.user.role === 'ADMIN' ? ['name', 'phone', 'isActive'] : ['name', 'phone']; const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key))); const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }); res.json({ success: true, message: 'Profile updated.', data: user.publicProfile() }) }))
router.patch('/:id/status', allow('ADMIN'), asyncHandler(async (req, res) => { if (req.user._id.toString() === req.params.id) throw new AppError('You cannot deactivate your own account.'); const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.isActive) }, { new: true }); if (!user) throw new AppError('User not found.', 404); res.json({ success: true, message: 'Account status updated.', data: user.publicProfile() }) }))
export default router
