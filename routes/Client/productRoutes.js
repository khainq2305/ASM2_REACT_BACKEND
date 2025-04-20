const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/Client/ProductController');


router.get('/products', ProductController.getAllActive);

router.get('/products/search', ProductController.search);

router.get('/products/featured', ProductController.getFeatured);
router.get('/products/:id', ProductController.getById);


module.exports = router;
