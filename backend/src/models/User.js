import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['ADMIN', 'DONOR', 'NGO'], required: true },
  phone: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})
userSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password) }
userSchema.methods.publicProfile = function () { return { id: this._id, name: this.name, email: this.email, role: this.role, phone: this.phone, isActive: this.isActive } }
export const User = mongoose.model('User', userSchema)
