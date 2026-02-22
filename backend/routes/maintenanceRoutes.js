const express = require('express');
const router = express.Router();
const {
    getMachines, createMachine, updateMachine, deleteMachine,
    getWorkOrders, createWorkOrder, updateWorkOrder
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

// Machine Routes
router.route('/machines')
    .get(protect, roleCheck(['admin', 'manager', 'technician']), getMachines)
    .post(protect, roleCheck(['admin', 'manager']), createMachine);

router.route('/machines/:id')
    .put(protect, roleCheck(['admin', 'manager']), updateMachine)
    .delete(protect, roleCheck(['admin']), deleteMachine);

// Work Order Routes (Root /api/maintenance)
router.route('/')
    .get(protect, getWorkOrders)
    .post(protect, createWorkOrder);

router.route('/:id')
    .put(protect, updateWorkOrder);

module.exports = router;
