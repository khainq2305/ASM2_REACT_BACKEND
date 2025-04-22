router.post('/register', UserController.register);


router.post('/login', UserController.login);
router.post("/google", UserController.googleLogin);

module.exports = router;