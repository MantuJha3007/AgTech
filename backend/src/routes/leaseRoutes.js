/**
 * src/routes/leaseRoutes.js
 */

const express = require('express');
const { body } = require('express-validator');
const { getLeases, getLeaseById, createLease, updateLease, deleteLease } = require('../controllers/leaseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getLeases);
router.get('/:id', getLeaseById);

router.post('/', authorize('landowner'), [
  body('land').notEmpty().withMessage('Land ID is required'),
  body('tenant').notEmpty().withMessage('Tenant ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
], createLease);

router.put('/:id', authorize('landowner'), updateLease);
router.delete('/:id', authorize('landowner'), deleteLease);

module.exports = router;
