const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const upload = require('../../middlewares/uploads');
const { Sequelize } = require('sequelize');
const CategoryController = require('../../controllers/Admin/categoryController');

router.get('/categories/list', CategoryController.get);   
router.get('/categories/active', CategoryController.getActiveCategories);

router.post('/categories/add', upload.single('image'), CategoryController.create);
router.put("/categories/update/:id",  upload.single('image'), CategoryController.update);         
router.delete("/categories/delete/:id", CategoryController.delete);      
router.get("/categories/:id", CategoryController.getById);         
router.put('/categories/soft-delete/:id', CategoryController.softDeleteCategory);
router.get('/categories/soft-delete/list', CategoryController.getAllSoftDelete);  
router.put('/categories/restore/:id', CategoryController.restoreCategory);  
router.put('/categories/restore/list', CategoryController.restoreCategory);
module.exports = router;