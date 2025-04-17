// models/index.js

// ===== ADMIN MODELS =====
const AdminProduct = require('./Admin/productModel');
const AdminCategory = require('./Admin/categoryModel');
const User = require('./Admin/userModel');
const AdminOrder = require('./Admin/orderModel');
const AdminOrderDetail = require('./Admin/orderDetailModel');

// ===== CLIENT MODELS =====
const Product = require('./Client/productModel');
const Category = require('./Client/categoryModel');
const Cart = require('./Client/CartModel');
const CheckoutAddress = require('./Client/checkoutAddressModel');
const ClientOrder = require('./Client/orderModel');
const ClientOrderDetail = require('./Client/orderDetailModel');

// ==========================
// ===== ADMIN RELATIONS ====
// ==========================
AdminProduct.belongsTo(AdminCategory, { foreignKey: 'idCategory', as: 'category' });
AdminCategory.hasMany(AdminProduct, { foreignKey: 'idCategory', as: 'products' });

AdminOrder.hasMany(AdminOrderDetail, { foreignKey: 'idOrder', as: 'orderDetails' });
AdminOrder.belongsTo(User, { foreignKey: 'idUser', as: 'customer' });
AdminOrder.belongsTo(CheckoutAddress, { foreignKey: 'checkout_address_id', as: 'shippingAddress' });

AdminOrderDetail.belongsTo(AdminOrder, { foreignKey: 'idOrder', as: 'order' });
AdminOrderDetail.belongsTo(AdminProduct, { foreignKey: 'idProduct', as: 'product' });

AdminProduct.hasMany(AdminOrderDetail, { foreignKey: 'idProduct', as: 'orderDetails' });

// ===========================
// ===== CLIENT RELATIONS ====
// ===========================
Product.belongsTo(Category, { foreignKey: 'idCategory', as: 'category' });
Category.hasMany(Product, { foreignKey: 'idCategory', as: 'products' });

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
  AdminProduct,
  AdminCategory,
  AdminOrder,
  AdminOrderDetail,

  // Client
  Product,
  Category,
  ClientOrder,
  ClientOrderDetail,
  Cart,
  CheckoutAddress,

  // Shared
  User,
};