const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/Admin/productController');
const upload = require('../../middlewares/uploads');

// Lấy danh sách sản phẩm (có filter, phân trang, status, category, deleted, sort)
router.get('/products/list', ProductController.get);
router.delete('/products/delete/:id', ProductController.delete); // ✅ SỬA lại đường dẫn

// Lấy chi tiết 1 sản phẩm theo ID
router.get('/products/:id', ProductController.getById);

// Thêm mới sản phẩm (upload ảnh thumbnail)
router.post(
  '/products/add',
  upload.fields([
    { name: 'image', maxCount: 1 }, // tên field ở formData
  ]),
  ProductController.create
);

// Cập nhật sản phẩm (thumbnail + media)
router.put(
  '/products/:id',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'media', maxCount: 10 }
  ]),
  ProductController.update
);

// XÓA MỀM NHIỀU sản phẩm
router.delete('/products/delete-multiple', ProductController.deleteMultiple);

// XÓA VĨNH VIỄN NHIỀU sản phẩm
router.delete('/products/permanent-delete-multiple', ProductController.forceDeleteMultiple);

// XÓA VĨNH VIỄN 1 sản phẩm
router.delete('/products/permanent/:id', ProductController.forceDelete);

// ✅ XÓA MỀM 1 sản phẩm (phải đặt SAU các route cụ thể)


// Lấy danh sách sản phẩm đã xoá
router.get('/products/trash/list', ProductController.trash);

// Khôi phục 1 sản phẩm
router.patch('/products/restore/:id', ProductController.restore);

// Khôi phục nhiều sản phẩm
router.patch('/products/restore-multiple', ProductController.restoreMultiple);

module.exports = router;
