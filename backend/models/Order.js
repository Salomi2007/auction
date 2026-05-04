const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  winningBid: { type: Number, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Dispatched', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
