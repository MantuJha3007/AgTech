/**
 * src/controllers/landController.js — CRUD for land parcels
 */

const { validationResult } = require('express-validator');
const Land = require('../models/Land');

/**
 * @route   GET /api/lands
 * @access  Private
 */
const getLands = async (req, res) => {
  try {
    const filter = req.user.role === 'landowner'
      ? { owner: req.user._id }
      : {}; // Tenants can see all lands

    const lands = await Land.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: lands.length, data: lands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/lands/:id
 * @access  Private
 */
const getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate('owner', 'name email phone');
    if (!land) return res.status(404).json({ success: false, message: 'Land not found.' });
    res.json({ success: true, data: land });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/lands
 * @access  Private (landowner only)
 */
const createLand = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const land = await Land.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, message: 'Land created successfully', data: land });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/lands/:id
 * @access  Private (landowner only)
 */
const updateLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ success: false, message: 'Land not found.' });

    if (land.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this land.' });
    }

    const updated = await Land.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Land updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/lands/:id
 * @access  Private (landowner only)
 */
const deleteLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ success: false, message: 'Land not found.' });

    if (land.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this land.' });
    }

    await land.deleteOne();
    res.json({ success: true, message: 'Land deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLands, getLandById, createLand, updateLand, deleteLand };
