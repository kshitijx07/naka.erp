const express = require('express');
const router = express.Router();
const {
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder,
} = require('../controllers/productionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getOrders).post(protect, admin, createOrder);
router.route('/:id').put(protect, admin, updateOrder).delete(protect, admin, deleteOrder);

module.exports = router;
