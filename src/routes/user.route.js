const userController = require('../controllers/user.controller');
const express = require('express');
const router = express.Router();

router.post('/register', userController.userRegister);
router.post('/login', userController.userLogin);
router.get('/:email', userController.getUserbyEmail);
router.put('/', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/topUp', userController.topUp);

module.exports = router;
