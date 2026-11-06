import mongoose from 'mongoose'
const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  foodName: { type: String, required: true, trim: true, index: 'text' },
  category: { type: String, required: true, enum: ['COOKED_MEAL', 'BAKERY', 'GROCERIES', 'FRUITS_VEGETABLES', 'PACKAGED', 'OTHER'], index: true },
  description: { type: String, required: true, trim: true, maxlength: 1500 },
  quantity: { type: Number, required: true, min: 0.01 },
  quantityUnit: { type: String, required: true, enum: ['SERVINGS', 'KG', 'PACKETS', 'ITEMS', 'LITRES'] },
  foodType: { type: String, required: true, enum: ['VEGETARIAN', 'NON_VEGETARIAN'], index: true },
  preparationDate: Date,
  expiresAt: { type: Date, required: true, index: true },
  pickupAddress: { type: String, required: true, trim: true, index: 'text' },
  pickupWindow: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true },
  notes: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKUP_SCHEDULED', 'COLLECTED', 'DISTRIBUTED', 'CANCELLED', 'EXPIRED'], default: 'AVAILABLE', index: true },
  allocatedQuantity: { type: Number, default: 0, min: 0 },
  assignedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'DonationRequest' }
}, { timestamps: true })
donationSchema.index({ status: 1, expiresAt: 1, category: 1, foodType: 1 })
export const Donation = mongoose.model('Donation', donationSchema)
