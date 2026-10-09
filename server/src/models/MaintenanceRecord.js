import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    maintenanceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceRequest',
      required: [true, 'Maintenance request reference is required'],
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required'],
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Technician reference is required'],
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    actionTaken: {
      type: String,
      required: [true, 'Action taken is required'],
      trim: true,
    },
    partsReplaced: [
      {
        name: { type: String, trim: true },
        cost: { type: Number, default: 0, min: 0 },
      },
    ],
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceRecordSchema.index({ asset: 1 });
maintenanceRecordSchema.index({ maintenanceRequest: 1 });
maintenanceRecordSchema.index({ technician: 1 });

const MaintenanceRecord = mongoose.model(
  'MaintenanceRecord',
  maintenanceRecordSchema
);
export default MaintenanceRecord;
