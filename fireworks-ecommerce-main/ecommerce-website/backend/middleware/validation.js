import Joi from 'joi';

// Product validation schema
export const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(100).trim(),
    price: Joi.number().required().positive().precision(2),
    stock: Joi.number().integer().min(0),
    category: Joi.string().required().trim(),
    brand: Joi.string().trim(),
    description: Joi.string().max(1000).trim(),
    images: Joi.array().items(Joi.string().uri()),
    featured: Joi.boolean()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};

// User registration validation schema
export const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50).trim(),
    email: Joi.string().email().required().trim(),
    password: Joi.string().required().min(6).max(128),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};

// User login validation schema
export const validateUserLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};

// Order validation schema
export const validateOrder = (req, res, next) => {
  const schema = Joi.object({
    orderItems: Joi.array().items(
      Joi.object({
        product: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required(),
        image: Joi.string().optional(),
        selectedWeight: Joi.object({
          weight: Joi.string().optional(),
          price: Joi.number().optional(),
          description: Joi.string().optional()
        }).optional()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    paymentMethod: Joi.string().required(),
    itemsPrice: Joi.number().positive().required(),
    taxPrice: Joi.number().min(0).required(),
    shippingPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().positive().required(),
    customerInfo: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required()
    }).optional()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};

// Profile update validation schema
export const validateProfileUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).trim().optional(),
    email: Joi.string().email().trim().optional(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    address: Joi.string().max(200).optional(),
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    postalCode: Joi.string().max(20).optional(),
    country: Joi.string().max(50).optional(),
    avatar: Joi.object().optional()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};

// Password change validation schema
export const validatePasswordChange = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};

// Order status update validation schema
export const validateOrderStatusUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};

// Search and filter validation schema
export const validateSearchFilters = (req, res, next) => {
  const schema = Joi.object({
    search: Joi.string().max(100).optional(),
    category: Joi.string().max(50).optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    sortBy: Joi.string().valid('price-low', 'price-high', 'name', 'rating', 'newest').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  });
  
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  next();
};
