import { Router } from 'express'
import { User } from '../models/User.js'
import { NgoProfile } from '../models/NgoProfile.js'
import { authenticate } from '../middleware/auth.js'
import { AppError, asyncHandler } from '../utils/AppError.js'
import { signToken } from '../utils/token.js'
import { loginSchema, registerSchema } from '../validators/schemas.js'
const router = Router()
router.post('/register', asyncHandler(async (req, res) => { const data = registerSchema.parse(req.body); if (await User.exists({ email: data.email.toLowerCase() })) throw new AppError('An account already uses this email.', 409); const user = await User.create(data); if (data.role === 'NGO') await NgoProfile.create({ user: user._id, ...data.ngoProfile }); res.status(201).json({ success: true, message: data.role === 'NGO' ? 'Registration submitted. An administrator must verify your NGO before requests are enabled.' : 'Account created.', data: { token: signToken(user), user: user.publicProfile() } }) }))
router.post('/login', asyncHandler(async (req, res) => { const { email, password } = loginSchema.parse(req.body); const user = await User.findOne({ email: email.toLowerCase() }).select('+password'); if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password.', 401); if (!user.isActive) throw new AppError('This account has been deactivated.', 403); res.json({ success: true, message: 'Welcome back.', data: { token: signToken(user), user: user.publicProfile() } }) }))
router.get('/me', authenticate, asyncHandler(async (req, res) => { const ngoProfile = req.user.role === 'NGO' ? await NgoProfile.findOne({ user: req.user._id }) : null; res.json({ success: true, data: { user: req.user.publicProfile(), ngoProfile } }) }))
export default router
