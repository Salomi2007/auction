const express = require('express');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('highestBidder', 'username');
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, imageUrl, startingPrice, duration } = req.body;
    const endTime = new Date(Date.now() + duration * 60000);
    const product = new Product({ name, description, imageUrl, startingPrice, currentBid: startingPrice, endTime });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
