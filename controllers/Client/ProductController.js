const { Op, fn, col, where, literal } = require("sequelize");
const Product = require('../../models/Client/ProductModel');
const removeAccents = require('remove-accents');

class ClientProductController {
  static async getById(req, res) {
    try {
      const id = req.params.id;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
  static async getAllActive(req, res) {
    try {
      const {
        categoryIds,
        page = 1,
        limit = 20,
        sort = 'desc'
      } = req.query;
  
      const where = { status: 1 };
  
      if (categoryIds) {
        const ids = categoryIds.split(',').map(id => parseInt(id, 10));
        where.idCategory = { [Op.in]: ids };
      }
  
      const offset = (parseInt(page) - 1) * parseInt(limit);
  
      const { rows: products, count: total } = await Product.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [['price', sort === 'asc' ? 'ASC' : 'DESC']]
      });
  
      // ✅ Tính toán finalPrice nếu bị null
      const processedProducts = products.map(product => {
        const plain = product.get({ plain: true });
  
        if (plain.finalPrice === null || plain.finalPrice === 0) {
          plain.finalPrice = plain.price * (1 - plain.discount / 100);
        }
  
        return plain;
      });
  
      res.status(200).json({
        data: processedProducts,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("🔥 Lỗi server:", error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
  static async getForHome(req, res) {
    try {
      const products = await Product.findAll({
        where: { status: true },
        limit: 12,
        order: [['createdAt', 'DESC']],
      });
  
      const result = products.map(p => {
        const plain = p.get({ plain: true });
        if (!plain.finalPrice) {
          plain.finalPrice = plain.price * (1 - plain.discount / 100);
        }
        return plain;
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi API trang chủ:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  static async search(req, res) {
    try {
      const q = req.query.q || "";
      const normalizedQuery = removeAccents(q.toLowerCase());
  
      const products = await Product.findAll({
        where: { status: true },
        limit: 100
      });
  
      const filtered = products.filter(p =>
        removeAccents(p.name.toLowerCase()).includes(normalizedQuery)
      );
  
      res.status(200).json(filtered);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
}
  
  


module.exports = ClientProductController;
