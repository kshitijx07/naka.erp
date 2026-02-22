const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, updateMaterial, deleteMaterial, updateStock, getStockHistory } = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, roleCheck(['admin', 'manager']), getMaterials)
    .post(protect, roleCheck(['admin', 'manager']), createMaterial);

router.route('/:id')
    .put(protect, roleCheck(['admin', 'manager']), updateMaterial)
    .delete(protect, roleCheck(['admin']), deleteMaterial);

router.route('/update')
    .post(protect, roleCheck(['admin', 'manager']), updateStock);

router.route('/:id/history')
    .get(protect, roleCheck(['admin', 'manager']), getStockHistory);

module.exports = router;
