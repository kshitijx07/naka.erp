const express = require('express');
const router = express.Router();
const { getSales, createSale, updateSale, deleteSale } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router
    .route('/')
    .get(protect, roleCheck(['admin', 'accountant']), getSales)
    .post(protect, roleCheck(['admin', 'accountant']), createSale);

router
    .route('/:id')
    .put(protect, roleCheck(['admin', 'accountant']), updateSale)
    .delete(protect, roleCheck(['admin', 'accountant']), deleteSale);

module.exports = router;
