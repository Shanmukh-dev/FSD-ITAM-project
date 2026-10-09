import mongoose from 'mongoose';
import {
  ASSET_STATUS,
  ASSET_CATEGORIES,
  ASSET_CONDITIONS,
  ASSET_TYPES,
  DIGITAL_LICENSE_TYPES,
  BILLING_CYCLES,
} from '../utils/constants.js';

const assetSchema = new mongoose.Schema(
  {
    // High-level asset classification
    assetType: {
      type: String,
      enum: Object.values(ASSET_TYPES),
      default: ASSET_TYPES.PHYSICAL,
    },

    // Identification
    assetTag: {
      type: String,
      required: [true, 'Asset tag is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ASSET_CATEGORIES,
    },
    brand: {
      type: String,
      trim: true,
      required: [
        function () {
          return !this.assetType || this.assetType === ASSET_TYPES.PHYSICAL;
        },
        'Brand / Manufacturer is required for physical assets',
      ],
    },
    model: {
      type: String,
      trim: true,
      required: [
        function () {
          return !this.assetType || this.assetType === ASSET_TYPES.PHYSICAL;
        },
        'Model is required for physical assets',
      ],
    },
    serialNumber: {
      type: String,
      trim: true,
      required: [
        function () {
          return !this.assetType || this.assetType === ASSET_TYPES.PHYSICAL;
        },
        'Serial number is required for physical assets',
      ],
    },

    // Purchase & Commercials
    vendor: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    warrantyExpiry: {
      type: Date,
    },

    // Organization
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    location: {
      type: String,
      trim: true,
    },

    // State & Condition
    status: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.AVAILABLE,
    },
    condition: {
      type: String,
      enum: ASSET_CONDITIONS,
      default: function () {
        return this.assetType === ASSET_TYPES.DIGITAL ? 'NOT_APPLICABLE' : 'NEW';
      },
    },

    // Current Assignment (1:1 custody for physical assets or single-user licenses)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Digital Assets & Multi-seat License Details
    digitalDetails: {
      licenseKey: {
        type: String,
        trim: true,
      },
      licenseType: {
        type: String,
        enum: DIGITAL_LICENSE_TYPES,
        default: 'SUBSCRIPTION',
      },
      seatsTotal: {
        type: Number,
        default: 1,
        min: [1, 'Total seats must be at least 1'],
      },
      seatsAllocated: {
        type: Number,
        default: 0,
        min: 0,
      },
      contractNumber: {
        type: String,
        trim: true,
      },
      contractType: {
        type: String,
        trim: true,
      },
      billingCycle: {
        type: String,
        enum: BILLING_CYCLES,
        default: 'ANNUAL',
      },
      validFrom: {
        type: Date,
        default: null,
      },
      validUntil: {
        type: Date,
        default: null,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      allocatedUsers: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          allocatedAt: {
            type: Date,
            default: Date.now,
          },
          notes: {
            type: String,
            trim: true,
          },
        },
      ],
    },

    // Financial Valuation / Depreciation
    depreciation: {
      usefulLifeYears: {
        type: Number,
        required: [true, 'Useful life in years is required'],
        min: [1, 'Useful life must be at least 1 year'],
        default: 3,
      },
      method: {
        type: String,
        default: 'STRAIGHT_LINE',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and filtering
assetSchema.index({ status: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ assetType: 1 });
assetSchema.index({ serialNumber: 1 }, { unique: true, sparse: true });
assetSchema.index({ 'digitalDetails.allocatedUsers.user': 1 });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
