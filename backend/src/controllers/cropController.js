/**
 * src/controllers/cropController.js — Crop tracking + lifecycle generation
 */

const { validationResult } = require('express-validator');
const Crop = require('../models/Crop');

/**
 * Generates a lifecycle timeline based on crop name and sow date.
 * Returns an array of lifecycle stage events with expected dates.
 */
const generateLifecycle = (cropName, sowDate) => {
  const crop = cropName.toLowerCase();
  const sow = new Date(sowDate);

  // Default lifecycle durations in days (generic)
  const lifecycleMap = {
    wheat:    { germination: 7,  vegetative: 30, flowering: 60,  fruiting: 90,  harvesting: 120 },
    rice:     { germination: 7,  vegetative: 45, flowering: 75,  fruiting: 100, harvesting: 135 },
    corn:     { germination: 7,  vegetative: 35, flowering: 65,  fruiting: 90,  harvesting: 110 },
    cotton:   { germination: 10, vegetative: 45, flowering: 80,  fruiting: 120, harvesting: 160 },
    sugarcane:{ germination: 20, vegetative: 90, flowering: 180, fruiting: 270, harvesting: 365 },
    soybean:  { germination: 7,  vegetative: 30, flowering: 55,  fruiting: 80,  harvesting: 100 },
    potato:   { germination: 14, vegetative: 35, flowering: 60,  fruiting: 80,  harvesting: 100 },
    tomato:   { germination: 7,  vegetative: 25, flowering: 50,  fruiting: 70,  harvesting: 90  },
    default:  { germination: 7,  vegetative: 35, flowering: 60,  fruiting: 85,  harvesting: 110 },
  };

  const durations = lifecycleMap[crop] || lifecycleMap['default'];

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  return [
    { stage: 'sowing',      expectedDate: sow,                                       completed: false },
    { stage: 'germination', expectedDate: addDays(sow, durations.germination),        completed: false },
    { stage: 'vegetative',  expectedDate: addDays(sow, durations.vegetative),         completed: false },
    { stage: 'flowering',   expectedDate: addDays(sow, durations.flowering),          completed: false },
    { stage: 'fruiting',    expectedDate: addDays(sow, durations.fruiting),           completed: false },
    { stage: 'harvesting',  expectedDate: addDays(sow, durations.harvesting),         completed: false },
    { stage: 'post-harvest',expectedDate: addDays(sow, durations.harvesting + 14),    completed: false },
  ];
};

/** @route GET /api/crops */
const getCrops = async (req, res) => {
  try {
    const filter = req.user.role === 'tenant'
      ? { tenant: req.user._id }
      : {};

    const crops = await Crop.find(filter)
      .populate('land', 'title location area')
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: crops.length, data: crops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route GET /api/crops/:id */
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('land', 'title location area soilType')
      .populate('tenant', 'name email phone');

    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found.' });
    res.json({ success: true, data: crop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route POST /api/crops */
const createCrop = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const lifecycle = generateLifecycle(req.body.name, req.body.sowDate);
    const lastStage = lifecycle[lifecycle.length - 1];

    const crop = await Crop.create({
      ...req.body,
      tenant: req.user._id,
      lifecycle,
      expectedHarvestDate: lifecycle.find(s => s.stage === 'harvesting')?.expectedDate,
    });

    const populated = await Crop.findById(crop._id)
      .populate('land', 'title location area')
      .populate('tenant', 'name email');

    res.status(201).json({ success: true, message: 'Crop created with lifecycle timeline', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route PUT /api/crops/:id */
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found.' });

    const updated = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
      .populate('land', 'title location area')
      .populate('tenant', 'name email');

    res.json({ success: true, message: 'Crop updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route DELETE /api/crops/:id */
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found.' });
    await crop.deleteOne();
    res.json({ success: true, message: 'Crop deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @route PATCH /api/crops/:id/lifecycle/:stage - Mark a lifecycle stage as complete */
const updateLifecycleStage = async (req, res) => {
  try {
    const { id, stage } = req.params;
    const { actualDate, notes } = req.body;

    const crop = await Crop.findById(id);
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found.' });

    const stageIndex = crop.lifecycle.findIndex(s => s.stage === stage);
    if (stageIndex === -1) return res.status(404).json({ success: false, message: 'Stage not found.' });

    crop.lifecycle[stageIndex].completed = true;
    crop.lifecycle[stageIndex].actualDate = actualDate || new Date();
    if (notes) crop.lifecycle[stageIndex].notes = notes;

    // Auto-update crop status
    if (stage === 'harvesting') crop.status = 'harvested';
    else if (stage !== 'sowing') crop.status = 'growing';

    await crop.save();
    res.json({ success: true, message: `Stage '${stage}' marked complete`, data: crop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCrops, getCropById, createCrop, updateCrop, deleteCrop, updateLifecycleStage };
