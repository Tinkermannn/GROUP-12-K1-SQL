const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/update', upload.single('profile_image_url'), userController.update);
router.delete('/:user_id', userController.delete);
router.get('/:user_id', userController.getUserById);

module.exports = router;
