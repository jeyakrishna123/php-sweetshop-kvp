import mongoose from 'mongoose';

const weightOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Weight option name is required'],
    trim: true,
    maxlength: [50, 'Weight option name cannot exceed 50 characters']
  },
  weight: {
    type: String,
    required: [true, 'Weight value is required'],
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  servingSize: {
    type: String,
    required: [true, 'Serving size is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['cakes', 'desserts', 'pastries', 'custom']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  multiplier: {
    type: Number,
    default: 1,
    min: [0.1, 'Multiplier must be at least 0.1']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculated price based on base price and multiplier
weightOptionSchema.virtual('calculatedPrice').get(function() {
  return this.basePrice * this.multiplier;
});

// Indexes for better performance
weightOptionSchema.index({ category: 1 });
weightOptionSchema.index({ isActive: 1 });
weightOptionSchema.index({ displayOrder: 1 });
weightOptionSchema.index({ weight: 1 });

// Static method to get weight options by category
weightOptionSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true })
    .sort({ displayOrder: 1, weight: 1 });
};

// Static method to get all active weight options
weightOptionSchema.statics.getAllActive = function() {
  return this.find({ isActive: true })
    .sort({ category: 1, displayOrder: 1, weight: 1 });
};

// Static method to create default weight options
weightOptionSchema.statics.createDefaults = async function() {
  const defaultOptions = [
    // Cake weight options
    { name: 'Small Cake', weight: '0.5', basePrice: 299, servingSize: '2-3 People', category: 'cakes', displayOrder: 1, description: 'Perfect for small celebrations' },
    { name: 'Medium Cake', weight: '1', basePrice: 499, servingSize: 'Serves 4-6', category: 'cakes', displayOrder: 2, description: 'Ideal for family gatherings' },
    { name: 'Large Cake', weight: '1.5', basePrice: 699, servingSize: '6-8 People', category: 'cakes', displayOrder: 3, description: 'Great for parties' },
    { name: 'Extra Large Cake', weight: '2', basePrice: 899, servingSize: '8-10 People', category: 'cakes', displayOrder: 4, description: 'Perfect for big celebrations' },
    
    // Dessert weight options
    { name: 'Small Dessert', weight: '0.25', basePrice: 149, servingSize: '1-2 People', category: 'desserts', displayOrder: 1, description: 'Perfect for one or two people' },
    { name: 'Medium Dessert', weight: '0.5', basePrice: 249, servingSize: '2-3 People', category: 'desserts', displayOrder: 2, description: 'Ideal for sharing' },
    { name: 'Large Dessert', weight: '1', basePrice: 399, servingSize: 'Serves 4-6', category: 'desserts', displayOrder: 3, description: 'Great for family' },
    
    // Pastry weight options
    { name: 'Small Pastry', weight: '0.3', basePrice: 99, servingSize: '1 Person', category: 'pastries', displayOrder: 1, description: 'Perfect for one person' },
    { name: 'Medium Pastry', weight: '0.6', basePrice: 179, servingSize: '2 People', category: 'pastries', displayOrder: 2, description: 'Ideal for sharing' },
    { name: 'Large Pastry', weight: '1', basePrice: 279, servingSize: '3-4 People', category: 'pastries', displayOrder: 3, description: 'Great for small groups' }
  ];

  // Check if any weight options exist
  const existingOptions = await this.countDocuments();
  if (existingOptions === 0) {
    console.log('Creating default weight options...');
    await this.insertMany(defaultOptions);
    console.log('Default weight options created successfully');
  }
  
  return defaultOptions;
};

const WeightOption = mongoose.model('WeightOption', weightOptionSchema);

export default WeightOption;
