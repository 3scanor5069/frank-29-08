// En la carpeta routes
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllInventoryItems);
router.post('/', inventoryController.createInventoryItem);
router.put('/:idInventario', inventoryController.updateInventoryItem);
router.delete('/:idInventario', inventoryController.deleteInventoryItem);
module.exports = router;