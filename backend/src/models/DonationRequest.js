import mongoose from 'mongoose'
const requestSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true, index: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestedQuantity: { type: Number, required: true, min: 0.01 },
  note: { type: String, trim: true, maxlength: 600 },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'PICKUP_SCHEDULED', 'COLLECTED', 'DISTRIBUTED'], default: 'PENDING', index: true },
  pickupSchedule: { type: String, trim: true },
  collectedAt: Date,
  distributedAt: Date
}, { timestamps: true })
requestSchema.index({ donation: 1, ngo: 1 }, { unique: true })
export const DonationRequest = mongoose.model('DonationRequest', requestSchema)
