// models/index.js
const Product = require('./Admin/productModel');
const Category = require('./Admin/categoryModel');
const User = require('./Admin/userModel');
const AdminOrder = require('./Admin/orderModel');
const AdminOrderDetail = require('./Admin/orderDetailModel');
const Cart = require('./Client/CartModel');
const CheckoutAddress = require('./Client/checkoutAddressModel');

const ClientOrder = require('./Client/OrderModel');
const ClientOrderDetail = require('./Client/OrderDetailModel');

// ==========================
// ===== ADMIN RELATIONS ====
// ==========================
AdminOrder.hasMany(AdminOrderDetail, { foreignKey: 'idOrder', as: 'orderDetails' });
AdminOrder.belongsTo(User, { foreignKey: 'idUser', as: 'customer' });
AdminOrder.belongsTo(CheckoutAddress, { foreignKey: 'checkout_address_id', as: 'shippingAddress' });

AdminOrderDetail.belongsTo(AdminOrder, { foreignKey: 'idOrder', as: 'order' });
AdminOrderDetail.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });

Product.hasMany(AdminOrderDetail, { foreignKey: 'idProduct', as: 'orderDetails' });
Product.belongsTo(Category, { foreignKey: 'idCategory', as: 'category' });

Category.hasMany(Product, { foreignKey: 'idCategory', as: 'products' });

// ===========================
// ===== CLIENT RELATIONS ====
// ===========================
ClientOrder.hasMany(ClientOrderDetail, { foreignKey: 'idOrder', as: 'orderDetails' });
ClientOrder.belongsTo(User, { foreignKey: 'idUser', as: 'customer' });
ClientOrder.belongsTo(CheckoutAddress, { foreignKey: 'checkout_address_id', as: 'shippingAddress' });

ClientOrderDetail.belongsTo(ClientOrder, { foreignKey: 'idOrder', as: 'order' });
ClientOrderDetail.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });

Product.hasMany(ClientOrderDetail, { foreignKey: 'idProduct', as: 'clientOrderDetails' });

// ==========================
// ===== EXPORT MODELS =====
// ==========================
module.exports = {
  // Admin
  AdminOrder,
  AdminOrderDetail,

  // Client
  ClientOrder,
  ClientOrderDetail,
  Cart,
  CheckoutAddress,

  // Shared
  Product,
  Category,
  User,
};
