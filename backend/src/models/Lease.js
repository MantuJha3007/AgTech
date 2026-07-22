/**
 * src/models/Lease.js — Lease agreement between landowner and tenant
 */

const mongoose = require('mongoose');

const LeaseSchema = new mongoose.Schema(
  {
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
    startDate: {
      type: Date,
      required: [true, 'Lease start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Lease end date is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Lease amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'one-time'],
      default: 'annually',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'pending', 'terminated'],
      default: 'pending',
    },
    terms: {
      type: String,
      maxlength: [2000, 'Terms cannot exceed 2000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure endDate is after startDate
LeaseSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Lease', LeaseSchema);
