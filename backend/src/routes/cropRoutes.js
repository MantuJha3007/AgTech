/**
 * src/routes/cropRoutes.js
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getCrops, getCropById, createCrop, updateCrop, deleteCrop, updateLifecycleStage,
} = require('../controllers/cropController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getCrops);
router.get('/:id', getCropById);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Crop name is required'),
  body('land').notEmpty().withMessage('Land ID is required'),
  body('sowDate').isISO8601().withMessage('Valid sow date required'),
  body('season').isIn(['kharif', 'rabi', 'zaid', 'summer', 'winter', 'year-round']).withMessage('Invalid season'),
], createCrop);

router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);
router.patch('/:id/lifecycle/:stage', updateLifecycleStage);

module.exports = router;
