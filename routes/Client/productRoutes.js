const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/Client/ProductController');


router.get('/products', ProductController.getAllActive);
router.get('/products/:id', ProductController.getById);
// routes/client/products.js hoặc tương tự
router.get('/home-products', ProductController.getForHome);
router.get('/search', ProductController.search);
module.exports = router;
