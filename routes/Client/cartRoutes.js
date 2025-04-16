const express = require('express');
const router = express.Router();
const CartController = require('../../controllers/Client/cartController');

const { checkJWT } = require('../../middlewares/authMiddleware');


router.post('/add', checkJWT, CartController.addToCart);
router.get('/user/:id', checkJWT, CartController.getCartByUser);
router.put('/update/:id', checkJWT, CartController.updateQuantity);
router.delete('/:id', checkJWT, CartController.deleteItem);
router.delete('/delete-multiple', checkJWT, CartController.deleteMultiple);

module.exports = router;
