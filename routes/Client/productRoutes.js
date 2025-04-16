const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/Client/ProductController');

router.get('/products/:id', ProductController.getById);

module.exports = router;
