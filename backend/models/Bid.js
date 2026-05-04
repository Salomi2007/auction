const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
