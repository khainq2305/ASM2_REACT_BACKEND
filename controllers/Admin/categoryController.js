const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
const CategoryModel = require('../../models/Admin/categoryModel');
const Product = require('../../models/Admin/productModel');
class CategoryController {

    static async get(req, res) {
        try {
          const page = parseInt(req.query.page) || 1;  // Trang hiện tại
          const limit = 5;  // Số lượng mục mỗi trang
          const offset = (page - 1) * limit;  // Số mục bỏ qua khi lấy dữ liệu cho trang đó
      
          const { search, status, createdAt } = req.query;

          const where = {};
          if (search) {
            where.name = { [Sequelize.Op.like]: `%${search}%` };
          }
          if (status !== undefined && status !== 'all') {
            where.status = status;
          }
          if (createdAt) {
            where.createdAt = {
              [Sequelize.Op.gte]: new Date(createdAt),
              [Sequelize.Op.lte]: new Date(new Date(createdAt).setHours(23, 59, 59)),
            };
          }
      
          // Kiểm tra soft delete
          where.deletedAt = null;
      
          // Lấy danh sách categories và tổng số mục
          const { count, rows } = await CategoryModel.findAndCountAll({
            attributes: ['id', 'name', 'description', 'imageUrl', 'status', 'createdAt', 'updatedAt'],
            where,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
          });
      
          const totalPages = Math.ceil(count / limit);  // Tính số trang
      
          // Lấy số lượng sản phẩm theo từng category
          const categoryIds = rows.map(c => c.id);
          const productCounts = await Product.findAll({
            attributes: [
              'idCategory',
              [Sequelize.fn('COUNT', Sequelize.col('id')), 'productCount'],
            ],
            where: {
              idCategory: { [Sequelize.Op.in]: categoryIds },
            },
            group: ['idCategory'],
          });
      
          const countMap = {};
          productCounts.forEach(item => {
            countMap[item.idCategory] = item.dataValues.productCount;
          });
      
          // Thêm số lượng sản phẩm vào các category
          const categoriesWithCounts = rows.map(category => ({
            ...category.toJSON(),
            productCount: countMap[category.id] || 0,
          }));
      
          res.status(200).json({
            status: 200,
            message: 'Lấy danh sách thành công',
            data: categoriesWithCounts,
            totalItems: count,
            totalPages,
            currentPage: page,
          });
        } catch (error) {
          console.error('Error fetching categories:', error);
          res.status(500).json({ error: error.message });
        }
      }
      static async getAllSoftDelete(req, res) {
        try {
            const {
              page = 1,
              limit = 5,
              search,
              sort,
              deleteDate,
            } = req.query;
        
            const offset = (parseInt(page) - 1) * parseInt(limit);
        
            const where = {
              deletedAt: { [Op.ne]: null },
            };
        
            if (search) {
              where.name = { [Op.like]: `%${search}%` };
            }
        
            if (deleteDate) {
              const startDate = new Date(deleteDate);
              const endDate = new Date(startDate);
              endDate.setHours(23, 59, 59, 999);
              where.deletedAt = {
                [Op.between]: [startDate, endDate],
              };
            }
        
            let order;
            switch (sort) {
              case 'nameAsc':
                order = [['name', 'ASC']];
                break;
              case 'nameDesc':
                order = [['name', 'DESC']];
                break;
              case 'dateAsc':
                order = [['deletedAt', 'ASC']];
                break;
              case 'dateDesc':
              default:
                order = [['deletedAt', 'DESC']];
            }
        
            const { count, rows } = await CategoryModel.findAndCountAll({
              where,
              attributes: ['id', 'name', 'description', 'imageUrl', 'status', 'createdAt', 'updatedAt', 'deletedAt'],
              paranoid: false,
              offset,
              limit: parseInt(limit),
              order,
            });
        
            if (!rows.length) {
              return res.status(200).json({
                status: 200,
                message: 'Không tìm thấy danh mục nào',
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: parseInt(page),
              });
            }
        
            res.status(200).json({
              status: 200,
              message: 'Lấy danh sách thành công',
              data: rows,
              totalItems: count,
              totalPages: Math.ceil(count / limit),
              currentPage: parseInt(page),
            });
          } catch (error) {
            console.error('Error fetching soft deleted categories:', error);
            res.status(500).json({
              status: 500,
              message: 'Lỗi server',
              error: error.message,
            });
          }
      }
    
    static async softDeleteCategory(req, res) {
        const { id } = req.params;

        try {
            
            if (!id) {
                return res.status(400).json({ message: 'Category ID is required' });
            }

            const category = await CategoryModel.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            await category.destroy();
            console.log(`[DEBUG] ➜ Đã xóa mềm category.`);

            const updatedCategory = await CategoryModel.findByPk(id, { paranoid: false });

            return res.status(200).json({
                message: 'Category soft-deleted successfully',
                category: updatedCategory
            });

        } catch (error) {
            return res.status(500).json({
                message: 'Error soft-deleting category',
                error: error.message,
                stack: error.stack
            });
        }
    }
    static async getById(req, res) {
        console.log("🔍 Gọi hàm getById với id:", req.params.id);
        try {
            const { id } = req.params;
            const category = await CategoryModel.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: "Id không tồn tại dd" });
            }

            res.status(200).json({
                "status": 200,
                "data": category
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            console.log('BODY:', req.body);
            console.log('FILE:', req.file);

            const { name, description, status } = req.body;
            const imageUrl = req.file ? req.file.filename : null;

            const newCategory = await CategoryModel.create({ name, description, status, imageUrl });


            return res.status(201).json(newCategory);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async update(req, res) {

        try {
            const categoryId = req.params.id;

            const category = await CategoryModel.findByPk(categoryId);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            const { name, description, status } = req.body;

            const imageUrl = req.file ? req.file.filename : category.imageUrl;
            
            await category.update({ name, description, status, imageUrl });

            return res.status(200).json(category); 
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            console.log("🗑 Xóa danh mục với id:", id);
            const category = await CategoryModel.findByPk(id, { paranoid: false });

            if (!category) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            await category.destroy();

            res.status(200).json({ message: "Xóa thành công" });
        } catch (error) {
            console.error("❌ Lỗi khi xoá:", error);
            res.status(500).json({ error: error.message });
        }
    }
    static async restoreCategory(req, res) {
        try {
            const { ids } = req.body; // Nếu là khôi phục nhiều danh mục, lấy từ body request
    
            // Nếu ids là mảng, xử lý cho nhiều bản ghi
            if (Array.isArray(ids) && ids.length > 0) {
                // Khôi phục nhiều danh mục cùng lúc
                const restored = await CategoryModel.restore({
                    where: {
                        id: {
                            [Sequelize.Op.in]: ids  // Sử dụng Op.in để kiểm tra nhiều ID
                        }
                    }
                });
    
                return res.status(200).json({
                    message: "Khôi phục thành công các danh mục",
                    restoredCount: restored[0] // Trả về số lượng bản ghi đã khôi phục
                });
            }
    
            // Nếu chỉ có 1 ID, khôi phục 1 danh mục
            const id = req.params.id || ids[0]; // Kiểm tra nếu có id trong params hoặc ids trong body
    
            const category = await CategoryModel.findByPk(id, { paranoid: false });
    
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
    
            if (!category.deletedAt) {
                return res.status(400).json({ message: 'Danh mục đã được phục hồi' });
            }
    
            await category.restore();
    
            return res.status(200).json({
                message: 'Danh mục đã được phục hồi thành công',
                data: category
            });
    
        } catch (error) {
            console.error("🔥 Lỗi khôi phục:", error);
            return res.status(500).json({
                message: 'Có lỗi xảy ra khi phục hồi danh mục'
            });
        }
    }
    // ✅ Lấy tất cả danh mục đang hoạt động (status = 1), không phân trang
static async getActiveCategories(req, res) {
  try {
    const categories = await CategoryModel.findAll({
      where: {
        status: 1,
        deletedAt: null
      },
      attributes: ['id', 'name']
    });

    return res.status(200).json({
      status: 200,
      message: 'Lấy danh mục đang hoạt động thành công',
      data: categories
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh mục active:', error);
    return res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
}

    
}

module.exports = CategoryController;
