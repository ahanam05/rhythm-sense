const express = require("express");
const router = express.Router();
const loginController = require('../controller/login');

router.get('/login', loginController.login_get);

module.exports = router;