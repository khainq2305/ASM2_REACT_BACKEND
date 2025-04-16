const Cart = require("../../models/Client/CartModel");
const User = require('../../models/Client/UserModel'); // ✅ thêm dòng này để fix lỗi
const Product = require('../../models/Client/ProductModel'); // ✅ import model Product

class CartController {
    static async addToCart(req, res) {
        try {
          const {product_id, quantity } = req.body;
          const idUser = req.user.id; // ✅ Lấy từ token
          console.log("📥 Body:", req.body); // ✅ THÊM LOG
          if (!idUser || !product_id || !quantity) {
            return res.status(400).json({ message: 'Thiếu thông tin' });
          }
          const user = await User.findByPk(idUser); // ✅ thay vì req.body.idUser

          if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại!" });
          }
          
          // Gọi model Cart để tạo bản ghi
          const newCart = await Cart.create({
            idUser,
            product_id,
            quantity
          });
    
          res.status(201).json({ message: 'Thêm vào giỏ hàng thành công', data: newCart });
        } catch (error) {
          console.error('❌ Lỗi thêm vào giỏ hàng:', error);
          res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
      }

     
      static async getCartByUser(req, res) {
        const { id } = req.params;
        try {
          const items = await Cart.findAll({
            where: { idUser: id },
            include: [
              {
                model: Product,
                as: 'product', // 👈 nếu bạn định nghĩa alias khi `Cart.belongsTo(Product, { ... })`
                attributes: ['id', 'name', 'image', 'price', 'discount']
              }
            ]
          });
          console.log("📦 Cart items (backend):", items);

          res.json({ message: "Lấy giỏ hàng thành công", data: items });
        } catch (err) {
          console.error("❌ Lỗi lấy giỏ hàng:", err);
          res.status(500).json({ message: "Lỗi", error: err.message });
        }
      }
      // PUT /cart/update/:id
static async updateQuantity(req, res) {
  try {
    const { id } = req.params; // cart item id
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Số lượng không hợp lệ" });
    }

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ message: "Cập nhật số lượng thành công", data: cartItem });
  } catch (error) {
    console.error("❌ Lỗi cập nhật số lượng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}
// DELETE /cart/:id
static async deleteItem(req, res) {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findByPk(id);

    if (!cartItem) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });
    }

    await cartItem.destroy();
    res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("❌ Lỗi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}
// DELETE /cart/delete-multiple
static async deleteMultiple(req, res) {
  try {
    const { ids } = req.body; // array of cart item IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm nào để xóa" });
    }

    await Cart.destroy({
      where: { id: ids }
    });

    res.json({ message: "Xóa nhiều sản phẩm thành công" });
  } catch (error) {
    console.error("❌ Lỗi xóa nhiều sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}

}

module.exports = CartController;
