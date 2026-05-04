const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { productId, fullName, phone, email, address } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (!product.highestBidder) {
      return res.status(403).json({ error: 'No bids placed on this product' });
    }
    
    if (product.highestBidder.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only the winner can submit delivery details' });
    }
    
    const existingOrder = await Order.findOne({ product: productId });
    if (existingOrder) {
      return res.status(400).json({ error: 'Delivery details already submitted' });
    }
    
    const order = new Order({
      product: productId,
      winner: req.user.userId,
      winningBid: product.currentBid,
      fullName,
      phone,
      email,
      address
    });
    
    await order.save();
    product.isActive = false;
    await product.save();
    
    res.status(201).json({ message: 'Delivery details submitted successfully', order });
  } catch (error) {
    console.error('Order submission error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/check/:productId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ product: req.params.productId, winner: req.user.userId });
    res.json({ hasSubmitted: !!order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product', 'name')
      .populate('winner', 'username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/admin/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('product', 'name').populate('winner', 'username email');
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
