const { Op } = require("sequelize");
const Product = require("../../models/Client/productModel");
const Category = require("../../models/Client/categoryModel"); 
const removeAccents = require("remove-accents");

class ClientProductController {
  static async getById(req, res) {
    try {
      const id = req.params.id;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

  static async getAllActive(req, res) {
    try {
      const { categoryIds, page = 1, limit = 20, sort = "desc" } = req.query;

      const where = { status: 1 };

      if (categoryIds) {
        const ids = categoryIds.split(",").map((id) => parseInt(id, 10));
        where.idCategory = { [Op.in]: ids };
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows: products, count: total } = await Product.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [["price", sort === "asc" ? "ASC" : "DESC"]],
      });

      const processedProducts = products.map((product) => {
        const plain = product.get({ plain: true });
        if (!plain.finalPrice) {
          plain.finalPrice =
            plain.discount && plain.discount > 0
              ? plain.price - plain.discount
              : null;
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
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

  static async getFeatured(req, res) {
    try {
      const products = await Product.findAll({
        where: {
          status: 1,
          is_feature: 1,
        },
        limit: 12,
        order: [["createdAt", "DESC"]],
      });

      if (!products.length) {
        return res.status(404).json({ message: "Không có sản phẩm nổi bật" });
      }

      const result = products.map((p) => {
        const plain = p.get({ plain: true });
        if (!plain.finalPrice) {
          plain.finalPrice =
            plain.discount && plain.discount > 0
              ? plain.price - plain.discount
              : null;
        }
        return plain;
      });

      res.status(200).json(result);
    } catch (error) {
      
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
  static async search(req, res) {
    try {
      const keyword = req.query.keyword || "";
     
  
      const products = await Product.findAll({
        where: {
          status: 1,
          name: {
            [Op.like]: `%${keyword}%`,
          },
        },
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
  
      const result = products.map((p) => {
        const plain = p.get({ plain: true });
        plain.finalPrice = plain.price - (plain.discount || 0);
        return plain;
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Lỗi tìm kiếm:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
  
}

module.exports = ClientProductController;
