const { Op } = require("sequelize");
const {
  AdminOrder,
  AdminOrderDetail,
  User,
  Product,
  CheckoutAddress
} = require("../../models");

class OrderController {
  static async get(req, res) {
    try {
      const { status, search, page = 1, fromDate, toDate, payment_status, sort = "desc" } = req.query;

      const limit = 10;
      const offset = (page - 1) * limit;
      const where = {};

      if (status) where.status = status;

      if (search) {
        where[Op.or] = [
          { id: { [Op.like]: `%${search}%` } },
          { '$customer.email$': { [Op.like]: `%${search}%` } },
          { '$customer.name$': { [Op.like]: `%${search}%` } }
        ];
      }

      if (payment_status) where.payment_status = payment_status;

      if (fromDate && toDate) {
        where.createdAt = {
          [Op.between]: [new Date(fromDate), new Date(toDate)],
        };
      } else if (fromDate) {
        where.createdAt = { [Op.gte]: new Date(fromDate) };
      } else if (toDate) {
        where.createdAt = { [Op.lte]: new Date(toDate) };
      }

      console.log('[DEBUG] Query params:', req.query);

      const { count, rows: orders } = await AdminOrder.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["id", "name", "email", "phone"],
          },
          {
            model: CheckoutAddress,
            as: "shippingAddress",
            attributes: ["province_name", "district_name", "ward_name", "address_detail"],
          },
        ],
        attributes: ["id", "createdAt", "total_price", "status", "payment_status", "phone", "payment_method"],
        limit,
        offset,
        order: [["createdAt", sort.toUpperCase()]]
      });

      res.status(200).json({
        status: 200,
        message: "Lấy danh sách đơn hàng thành công",
        data: orders,
        total: count,
        page: +page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error("🔥 Lỗi khi lấy danh sách đơn hàng:", error.message, error.stack);
      res.status(500).json({
        status: 500,
        message: "Lỗi khi lấy danh sách đơn hàng",
        error: error.message,
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await AdminOrder.findOne({
        where: { id },
        include: [
          {
            model: AdminOrderDetail,
            as: "orderDetails",
            attributes: ["idOrder", "idProduct", "quantity", "price"],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["name", "price", "image"],
              },
            ],
          },
          {
            model: User,
            as: "customer",
            attributes: ["id", "name", "email", "phone"],
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      res.json({ status: 200, data: order });
    } catch (error) {
      console.error("🔥 Lỗi getById:", error.message, error.stack);
      res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng", error: error.message });
    }
  }

  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const reason = req.body?.reason?.trim();

      if (!reason) {
        return res.status(400).json({ status: 400, message: "Lý do hủy đơn không được để trống" });
      }

      const order = await AdminOrder.findOne({ where: { id } });
      if (!order) return res.status(404).json({ status: 404, message: "Đơn hàng không tồn tại" });

      if ([2, 3].includes(order.status) || order.payment_status === "paid") {
        return res.status(400).json({ status: 400, message: "Không thể hủy đơn đã thanh toán hoặc đang giao" });
      }

      if (order.status === 4) {
        return res.status(400).json({ status: 400, message: "Đơn đã bị hủy trước đó" });
      }

      await AdminOrder.update({ status: 4, cancel_reason: reason }, { where: { id } });
      res.status(200).json({ status: 200, message: "Đã hủy đơn hàng thành công" });
    } catch (error) {
      console.error("🔥 Lỗi khi hủy đơn hàng:", error);
      res.status(500).json({ status: 500, message: "Lỗi khi hủy đơn hàng", error: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const newStatus = parseInt(status);

      if (isNaN(newStatus)) {
        return res.status(400).json({ status: 400, message: "Trạng thái không hợp lệ" });
      }

      const order = await AdminOrder.findOne({ where: { id } });
      if (!order) return res.status(404).json({ status: 404, message: "Đơn hàng không tồn tại" });

      if (newStatus < order.status) {
        return res.status(400).json({ status: 400, message: "Không thể quay lại trạng thái trước đó" });
      }

      await AdminOrder.update({ status: newStatus }, { where: { id } });
      res.status(200).json({ status: 200, message: "Cập nhật trạng thái thành công", newStatus });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      res.status(500).json({ status: 500, message: "Lỗi khi cập nhật trạng thái đơn hàng", error: error.message });
    }
  }
}

module.exports = OrderController;
