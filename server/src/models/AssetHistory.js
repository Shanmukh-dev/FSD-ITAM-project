import mongoose from 'mongoose';
import { HISTORY_ACTIONS } from '../utils/constants.js';

const assetHistorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: Object.values(HISTORY_ACTIONS),
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who performed action is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false,
  }
);

assetHistorySchema.index({ asset: 1, timestamp: -1 });

const AssetHistory = mongoose.model('AssetHistory', assetHistorySchema);
export default AssetHistory;
