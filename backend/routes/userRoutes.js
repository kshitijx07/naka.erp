const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, roleCheck(['admin', 'manager']), getUsers);

router.route('/:id')
    .delete(protect, roleCheck(['admin']), deleteUser)
    .put(protect, roleCheck(['admin']), updateUser);

module.exports = router;
