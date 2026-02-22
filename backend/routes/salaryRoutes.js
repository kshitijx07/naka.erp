const express = require('express');
const router = express.Router();
const { getSalaries, generateSalary, updateSalary, deleteSalary } = require('../controllers/salaryController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router
    .route('/')
    .get(protect, roleCheck(['admin', 'accountant']), getSalaries);

router
    .route('/generate')
    .post(protect, roleCheck(['admin', 'accountant']), generateSalary);

router
    .route('/:id')
    .put(protect, roleCheck(['admin']), updateSalary)
    .delete(protect, roleCheck(['admin']), deleteSalary);

module.exports = router;
