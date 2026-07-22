/**
 * src/routes/aiRoutes.js
 */

const express = require('express');
const { suggestCrops } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/suggest', suggestCrops);

module.exports = router;
