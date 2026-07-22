/**
 * src/controllers/leaseController.js — CRUD for lease agreements
 */

const { validationResult } = require('express-validator');
const Lease = require('../models/Lease');
const Land = require('../models/Land');

/**
 * @route   GET /api/leases
 * @access  Private
 */
const getLeases = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'landowner') {
      // Get lands owned by this user, then find leases for those lands
      const ownedLands = await Land.find({ owner: req.user._id }).select('_id');
      const landIds = ownedLands.map((l) => l._id);
      filter = { land: { $in: landIds } };
    } else {
      filter = { tenant: req.user._id };
    }

    const leases = await Lease.find(filter)
      .populate('land', 'title location area')
      .populate('tenant', 'name email phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leases.length, data: leases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/leases/:id
 * @access  Private
 */
const getLeaseById = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('land', 'title location area soilType')
      .populate('tenant', 'name email phone')
      .populate('createdBy', 'name');

    if (!lease) return res.status(404).json({ success: false, message: 'Lease not found.' });

    res.json({ success: true, data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/leases
 * @access  Private (landowner only)
 */
const createLease = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    // Verify the land belongs to the requesting user
    const land = await Land.findById(req.body.land);
    if (!land) return res.status(404).json({ success: false, message: 'Land not found.' });

    if (land.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to create lease for this land.' });
    }

    const lease = await Lease.create({ ...req.body, createdBy: req.user._id });
    // Mark land as unavailable
    await Land.findByIdAndUpdate(req.body.land, { isAvailable: false });

    const populated = await Lease.findById(lease._id)
      .populate('land', 'title location area')
      .populate('tenant', 'name email');

    res.status(201).json({ success: true, message: 'Lease created successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/leases/:id
 * @access  Private (landowner only)
 */
const updateLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ success: false, message: 'Lease not found.' });

    if (lease.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const updated = await Lease.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('land', 'title location area')
      .populate('tenant', 'name email');

    res.json({ success: true, message: 'Lease updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/leases/:id
 * @access  Private (landowner only)
 */
const deleteLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ success: false, message: 'Lease not found.' });

    if (lease.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Mark land as available again
    await Land.findByIdAndUpdate(lease.land, { isAvailable: true });
    await lease.deleteOne();

    res.json({ success: true, message: 'Lease deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeases, getLeaseById, createLease, updateLease, deleteLease };
