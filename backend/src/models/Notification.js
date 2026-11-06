import mongoose from 'mongoose'
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true }, message: { type: String, required: true }, read: { type: Boolean, default: false }, link: String
}, { timestamps: true })
export const Notification = mongoose.model('Notification', notificationSchema)
