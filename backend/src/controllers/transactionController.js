/**
 * src/controllers/transactionController.js — P&L ledger CRUD
 */

const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

/** @route GET /api/transactions */
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category, landId } = req.query;
    const filter = { createdBy: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (landId) filter.land = landId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('land', 'title location')
      .populate('crop', 'name variety')
      .sort({ date: -1 });

    // Calculate P&L summary
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      count: transactions.length,
      summary: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        profitMargin: totalIncome > 0
          ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(2) + '%'
          : '0%',
      },
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route POST /api/transactions */
const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const tx = await Transaction.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Transaction recorded', data: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route PUT /api/transactions/:id */
const updateTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    if (tx.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    res.json({ success: true, message: 'Transaction updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route DELETE /api/transactions/:id */
const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    if (tx.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await tx.deleteOne();
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
