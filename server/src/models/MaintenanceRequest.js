import mongoose from 'mongoose';
import {
  MAINTENANCE_STATUS,
  MAINTENANCE_ISSUE_TYPES,
  MAINTENANCE_URGENCY,
} from '../utils/constants.js';

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    issueType: {
      type: String,
      required: [true, 'Issue type is required'],
      enum: MAINTENANCE_ISSUE_TYPES,
    },
    description: {
      type: String,
      required: [true, 'Description of issue is required'],
      trim: true,
    },
    urgency: {
      type: String,
      enum: MAINTENANCE_URGENCY,
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.REPORTED,
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceRequestSchema.index({ asset: 1 });
maintenanceRequestSchema.index({ reportedBy: 1 });
maintenanceRequestSchema.index({ assignedTechnician: 1 });
maintenanceRequestSchema.index({ status: 1 });

const MaintenanceRequest = mongoose.model(
  'MaintenanceRequest',
  maintenanceRequestSchema
);
export default MaintenanceRequest;
