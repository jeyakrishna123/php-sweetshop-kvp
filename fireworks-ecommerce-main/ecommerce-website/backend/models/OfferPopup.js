import mongoose from 'mongoose';

const offerPopupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  offerText: {
    type: String,
    required: true,
    trim: true
  },
  offerSubtext: {
    type: String,
    required: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  couponCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  minimumOrderAmount: {
    type: Number,
    required: true,
    min: 0
  },
  termsAndConditions: {
    type: String,
    required: true,
    trim: true
  },
  products: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    initials: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2
    },
    color: {
      type: String,
      required: true,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  showDelay: {
    type: Number,
    default: 2000, // milliseconds
    min: 0
  },
  maxShowsPerSession: {
    type: Number,
    default: 1,
    min: 1
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for active popups
offerPopupSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export default mongoose.model('OfferPopup', offerPopupSchema);
