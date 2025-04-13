const express = require('express');
const multer = require('multer');
const itemController = require('../controllers/item.controller');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', upload.single('image'), itemController.createItem);
router.get('/', itemController.getItem);
router.get('/byId/:id', itemController.getItemById);
router.get('/byStoreId/:store_id', itemController.getItemByStoreId);
router.put('/',upload.single('image'), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;

