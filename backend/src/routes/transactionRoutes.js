/**
 * src/routes/transactionRoutes.js
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions, createTransaction, updateTransaction, deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTransactions);

router.post('/', [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('amount').isNumeric().isFloat({ min: 0 }).withMessage('Valid amount required'),
  body('date').isISO8601().withMessage('Valid date required'),
], createTransaction);

router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
