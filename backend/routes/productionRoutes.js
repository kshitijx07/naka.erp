const express = require('express');
const router = express.Router();
const {
    getProductionLogs,
    addProductionLog,
    updateProductionLog,
    deleteProductionLog,
} = require('../controllers/productionLogController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProductionLogs).post(protect, addProductionLog);
router.route('/:id').put(protect, updateProductionLog).delete(protect, deleteProductionLog);

module.exports = router;
