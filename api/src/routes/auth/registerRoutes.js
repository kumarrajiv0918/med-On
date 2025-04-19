const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/auth/registerController');
const updateUserController = require('../../controllers/auth/updateUserController')

router.post('/register', registerController.register);
router.put('/updateUser/:id', updateUserController.updateUser);
module.exports = router;
