// routes/admin/product.routes.js
const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/Admin/productController');
const upload = require('../../middlewares/uploads');

// GET - danh sách sản phẩm
router.get('/products/list', ProductController.get);

// POST - tạo mới
router.post(
  '/products/add',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  ProductController.create
);

// PUT - cập nhật
router.put(
  '/products/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  ProductController.update
);

// DELETE - xóa mềm nhiều
router.delete('/products/delete-multiple', ProductController.deleteMultiple);

// DELETE - xóa vĩnh viễn nhiều
router.delete('/products/permanent-delete-multiple', ProductController.forceDeleteMultiple);

// DELETE - xóa vĩnh viễn 1
router.delete('/products/permanent/:id', ProductController.forceDelete);

// PATCH - khôi phục 1
router.patch('/products/restore/:id', ProductController.restore);

// PATCH - khôi phục nhiều
router.patch('/products/restore-multiple', ProductController.restoreMultiple);

// ⚠️ NÊN ĐẶT Ở CUỐI: DELETE - xóa mềm 1 sản phẩm
router.delete('/products/delete/:id', ProductController.delete);

module.exports = router;
