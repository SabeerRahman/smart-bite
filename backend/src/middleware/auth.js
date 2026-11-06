import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { AppError, asyncHandler } from '../utils/AppError.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) throw new AppError('Authentication is required.', 401)
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET) } catch { throw new AppError('Your session is invalid or expired.', 401) }
  const user = await User.findById(payload.sub)
  if (!user || !user.isActive) throw new AppError('This account is unavailable.', 403)
  req.user = user; next()
})
export const allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : next(new AppError('You do not have permission for this action.', 403))
