
const express = require('express');
const authController = require('../../controllers/auth/authController');
const statusUpdate = require('../../controllers/auth/statusUpdateController')
const router = express.Router();

router.post('/login', authController.login);
router.put('/updateUserStatus/:id', statusUpdate.updateUserStatus);

module.exports = router;