/**
 * src/models/Land.js — Land parcel schema
 */

const mongoose = require('mongoose');

const LandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Land title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    area: {
      type: Number,
      required: [true, 'Area in acres is required'],
      min: [0.1, 'Area must be at least 0.1 acres'],
    },
    soilType: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'],
      default: 'loamy',
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    surveyNumber: {
      type: String,
      trim: true,
    },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Land', LandSchema);
