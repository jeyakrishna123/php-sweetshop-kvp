import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  // New category structure
  cakeFlavor: {
    type: String,
    trim: true
  },
  productTypes: [{
    type: String,
    enum: ['cakes', 'sweets', 'newItems', 'specialItems'],
    trim: true
  }],
  isNew: {
    type: Boolean,
    default: false
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: [{
    type: String,
    required: [true, 'Product image is required']
  }],
  thumbnail: {
    type: String,
    required: [true, 'Product thumbnail is required']
  },
  specifications: {
    type: Map,
    of: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  // Weight options for cakes and other products
  hasWeightOptions: {
    type: Boolean,
    default: false
  },
  weightOptions: [{
    weight: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    servingSize: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }],
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= 5) return 'low_stock';
  return 'in_stock';
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ cakeFlavor: 1 });
productSchema.index({ productTypes: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });

// Pre-save middleware to update average rating
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.averageRating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 8) {
  return this.find({ featured: true, isActive: true })
    .populate('category', 'name')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get products by category
productSchema.statics.getByCategory = function(categoryId, limit = 20) {
  return this.find({ category: categoryId, isActive: true })
    .populate('category', 'name')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get products by cake flavor
productSchema.statics.getByCakeFlavor = function(flavor, limit = 20) {
  return this.find({ 
    cakeFlavor: flavor, 
    isActive: true,
    productTypes: 'cakes'
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

// Static method to get products by product type
productSchema.statics.getByProductType = function(productType, limit = 20) {
  const query = { 
    isActive: true,
    productTypes: productType
  };
  
  // Special handling for new items
  if (productType === 'newItems') {
    query.isNew = true;
  }
  
  return this.find(query)
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get all products (for "All Products" tab)
productSchema.statics.getAllProducts = function(limit = 20) {
  return this.find({ isActive: true })
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to search products
productSchema.statics.search = function(query, limit = 20) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  })
  .populate('category', 'name')
  .limit(limit)
  .sort({ averageRating: -1, soldCount: -1 });
};

// Instance method to increment view count
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment sold count
productSchema.methods.incrementSoldCount = function(quantity = 1) {
  this.soldCount += quantity;
  this.stock = Math.max(0, this.stock - quantity);
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;
