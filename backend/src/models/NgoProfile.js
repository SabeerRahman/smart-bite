import mongoose from 'mongoose'
const ngoProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  ngoName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  registrationNumber: { type: String, trim: true },
  description: { type: String, trim: true, maxlength: 1000 },
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING', index: true },
  verificationNote: { type: String, trim: true }
}, { timestamps: true })
export const NgoProfile = mongoose.model('NgoProfile', ngoProfileSchema)
