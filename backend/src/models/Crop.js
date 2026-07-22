/**
 * src/models/Crop.js — Crop tracking with lifecycle timeline
 */

const mongoose = require('mongoose');

// Lifecycle event sub-document
const LifecycleEventSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ['sowing', 'germination', 'vegetative', 'flowering', 'fruiting', 'harvesting', 'post-harvest'],
    required: true,
  },
  expectedDate: { type: Date, required: true },
  actualDate: { type: Date },
  notes: { type: String },
  completed: { type: Boolean, default: false },
}, { _id: false });

const CropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
    },
    land: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: [true, 'Land reference is required'],
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant reference is required'],
    },
    sowDate: {
      type: Date,
      required: [true, 'Sowing date is required'],
    },
    expectedHarvestDate: {
      type: Date,
    },
    actualHarvestDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['planned', 'growing', 'harvested', 'failed'],
      default: 'planned',
    },
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'year-round'],
      required: [true, 'Season is required'],
    },
    estimatedYield: {
      type: Number, // in kg
      min: 0,
    },
    actualYield: {
      type: Number,
      min: 0,
    },
    lifecycle: [LifecycleEventSchema],
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', CropSchema);
