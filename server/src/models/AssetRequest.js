import mongoose from 'mongoose';
import {
  ASSET_CATEGORIES,
  REQUEST_STATUS,
  REQUEST_PRIORITIES,
} from '../utils/constants.js';

const assetRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    category: {
      type: String,
      required: [true, 'Asset category is required'],
      enum: ASSET_CATEGORIES,
    },
    reason: {
      type: String,
      required: [true, 'Reason for request is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: REQUEST_PRIORITIES,
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    fulfilledAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

assetRequestSchema.index({ requester: 1 });
assetRequestSchema.index({ status: 1 });

const AssetRequest = mongoose.model('AssetRequest', assetRequestSchema);
export default AssetRequest;
