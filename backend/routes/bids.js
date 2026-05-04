const express = require('express');
const Bid = require('../models/Bid');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive || new Date() > product.endTime) {
      return res.status(400).json({ error: 'Auction ended or invalid' });
    }
    
    if (amount <= product.currentBid) {
      return res.status(400).json({ error: 'Bid must be higher than current bid' });
    }
    
    const bid = new Bid({ product: productId, user: req.user.userId, amount });
    await bid.save();
    
    product.currentBid = amount;
    product.highestBidder = req.user.userId;
    await product.save();
    
    res.status(201).json({ message: 'Bid placed successfully', bid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
