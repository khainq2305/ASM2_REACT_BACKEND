const Cart = require("../../models/Client/CartModel");
const User = require('../../models/Client/userModel'); // ✅ thêm dòng này để fix lỗi
const Product = require('../../models/Client/productModel'); // ✅ import model Product

class CartController {
  static async addToCart(req, res) {
    try {
      const { product_id, quantity } = req.body;
      const idUser = req.user.id;
  
      if (!idUser || !product_id || !quantity) {
        return res.status(400).json({ message: 'Thiếu thông tin' });
      }
  
      const user = await User.findByPk(idUser);
      if (!user) {
        return res.status(400).json({ message: "Người dùng không tồn tại!" });
      }
  
      // 🔍 Kiểm tra xem đã có sản phẩm này trong giỏ chưa
      let existing = await Cart.findOne({ where: { idUser, product_id } });
  
      if (existing) {
        // ✅ Nếu có rồi thì cộng dồn số lượng
        existing.quantity += quantity;
        await existing.save();
        return res.status(200).json({ message: 'Cập nhật số lượng giỏ hàng', data: existing });
      }
  
      // ❌ Nếu chưa có thì thêm mới
      const newCart = await Cart.create({ idUser, product_id, quantity });
      return res.status(201).json({ message: 'Thêm vào giỏ hàng thành công', data: newCart });
  
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
                attributes: ['id', 'name', 'image', 'price', 'discount', 'quantity']
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
