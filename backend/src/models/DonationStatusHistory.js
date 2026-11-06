import mongoose from 'mongoose'
const historySchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true, index: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'DonationRequest' },
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, trim: true }
}, { timestamps: true })
export const DonationStatusHistory = mongoose.model('DonationStatusHistory', historySchema)
