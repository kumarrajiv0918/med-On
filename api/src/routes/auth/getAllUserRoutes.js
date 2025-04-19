const express = require('express');
const router = express.Router();
const getAllUsersController = require('../../controllers/auth/getAllUsersController')
router.get('/users', getAllUsersController.getAllUsers);

module.exports = router;