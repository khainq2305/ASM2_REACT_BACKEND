const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const ProductController = require('../../controllers/Client/ProductController');
const cartRoutes = require('./cartRoutes'); // ✅ THÊM
const orderRoutes = require('./orderRoutes'); // ✅ THÊM DÒNG NÀY
const ghnRoutes = require('./ghn');
const productRoutes = require('./productRoutes'); // ✅ THÊM DÒNG NÀY
// Route đăng nhập, đăng ký
router.use('/', authRoutes);

router.use('/', productRoutes); // ✅ GẮN ROUTE SẢN PHẨM
router.use('/ghn', ghnRoutes); // ✅ GẮN VÀO
// Route sản phẩm cho client
router.get('/:id', ProductController.getById);

// ✅ Gắn route giỏ hàng
router.use('/cart', cartRoutes);
// ✅ Route đơn hàng
router.use('/orders', orderRoutes); // 👈 GẮN VÀO
module.exports = router;
