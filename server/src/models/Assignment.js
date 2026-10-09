import mongoose from 'mongoose';
import { ASSET_CONDITIONS } from '../utils/constants.js';

const assignmentSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigner is required'],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    returnCondition: {
      type: String,
      enum: ASSET_CONDITIONS,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ asset: 1, isActive: 1 });
assignmentSchema.index({ employee: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
