
const express = require('express');
const authController = require('../../controllers/auth/authController');
const statusUpdate = require('../../controllers/auth/statusUpdateController')
const router = express.Router();
const authentication = require('../../middlewares/authentication'); 

router.post('/login', authController.login);
router.put('/updateUserStatus/:id',authentication, statusUpdate.updateUserStatus);

module.exports = router;