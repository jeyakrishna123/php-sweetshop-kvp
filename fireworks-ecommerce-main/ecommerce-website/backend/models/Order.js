import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
        product: {
          type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
          required: true,
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
        },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
      },
  image: {
        type: String,
    required: true
  },
  sku: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
      type: String,
      required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
      required: true,
    trim: true
    },
  state: {
    type: String,
      required: true,
    trim: true
    },
  postalCode: {
    type: String,
      required: true,
    trim: true
    },
  country: {
    type: String,
      required: true,
    trim: true,
    default: 'India'
    },
  isDefault: {
      type: Boolean,
    default: false
  }
});

const paymentInfoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
    },
    status: {
      type: String,
      required: true,
    enum: ['pending', 'completed', 'failed', 'refunded']
  },
  method: {
    type: String,
    required: true,
    enum: ['stripe', 'cod', 'razorpay', 'paypal']
  },
  transactionId: String,
  paymentDate: Date,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundDate: Date
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentInfo: paymentInfoSchema,
    trackingNumber: {
      type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  itemsPrice: {
    type: Number,
    required: true,
    min: [0, 'Items price cannot be negative']
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Tax price cannot be negative']
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Shipping price cannot be negative']
    },
    discountAmount: {
      type: Number,
      default: 0,
    min: [0, 'Discount cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  notes: {
    customer: String,
    admin: String
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  shippingMethod: {
      type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  shippingCarrier: String,
  shippingTrackingUrl: String,
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationDate: Date,
    refundAmount: {
      type: Number,
    default: 0
  },
  refundReason: String,
  refundDate: Date,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ 'shippingAddress.city': 1 });
orderSchema.index({ 'shippingAddress.state': 1 });

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return {
    totalItems: this.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: this.totalPrice,
    status: this.status,
    orderDate: this.createdAt
  };
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'delivered') return 'delivered';
  if (this.status === 'shipped') return 'in_transit';
  if (this.status === 'processing') return 'processing';
  if (this.status === 'confirmed') return 'confirmed';
  if (this.status === 'pending') return 'pending';
  return 'unknown';
});

// Pre-save middleware to generate tracking number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.trackingNumber) {
    this.trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  
  // Add status to history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  
  next();
});

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy
  });
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.isCancelled = true;
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancellationDate = new Date();
  
  this.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Order cancelled: ${reason}`,
    updatedBy: cancelledBy
  });
  
  return this.save();
};

// Instance method to process refund
orderSchema.methods.processRefund = function(amount, reason, refundedBy) {
  this.refundAmount = amount;
  this.refundReason = reason;
  this.refundedBy = refundedBy;
  this.refundDate = new Date();
  
  if (amount >= this.totalPrice) {
    this.status = 'refunded';
    this.statusHistory.push({
      status: 'refunded',
      timestamp: new Date(),
      note: `Full refund processed: ${reason}`,
      updatedBy: refundedBy
    });
  } else {
    this.statusHistory.push({
      status: 'partial_refund',
      timestamp: new Date(),
      note: `Partial refund of ${amount}: ${reason}`,
      updatedBy: refundedBy
    });
  }
  
  return this.save();
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status, limit = 20) {
  return this.find({ status })
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get orders by user
orderSchema.statics.getByUser = function(userId, limit = 20) {
  return this.find({ user: userId })
    .populate('orderItems.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' },
        pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }
    }
  ]);
};

// Static method to get daily revenue
orderSchema.statics.getDailyRevenue = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

export default Order;

