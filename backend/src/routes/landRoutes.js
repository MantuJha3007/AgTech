/**
 * src/routes/landRoutes.js
 */

const express = require('express');
const { body } = require('express-validator');
const { getLands, getLandById, createLand, updateLand, deleteLand } = require('../controllers/landController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getLands);
router.get('/:id', getLandById);

router.post('/', authorize('landowner'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('area').isNumeric().withMessage('Area must be a number').isFloat({ min: 0.1 }).withMessage('Area must be at least 0.1 acres'),
], createLand);

router.put('/:id', authorize('landowner'), updateLand);
router.delete('/:id', authorize('landowner'), deleteLand);

module.exports = router;
