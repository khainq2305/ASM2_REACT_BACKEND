const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/Client/AuthController');



router.post('/register', UserController.register);


router.post('/login', UserController.login);
router.post("/google", UserController.googleLogin);

module.exports = router;
