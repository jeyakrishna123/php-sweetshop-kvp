import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const productsFile = path.join(dataDir, 'products.json');
const usersFile = path.join(dataDir, 'users.json');
const ordersFile = path.join(dataDir, 'orders.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const reviewsFile = path.join(dataDir, 'reviews.json');
const offerPopupsFile = path.join(dataDir, 'offerPopups.json');
const menuItemsFile = path.join(dataDir, 'menuItems.json');
const weightOptionsFile = path.join(dataDir, 'weightOptions.json');

// Initialize files if they don't exist
const initializeFile = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initializeFile(productsFile);
initializeFile(usersFile);
initializeFile(ordersFile);
initializeFile(categoriesFile);
initializeFile(reviewsFile);
initializeFile(offerPopupsFile);
initializeFile(menuItemsFile);
initializeFile(weightOptionsFile);

// Helper function to read JSON file
const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}, returning empty array`);
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    
    // Handle empty files
    if (!data.trim()) {
      console.log(`⚠️ Empty file: ${filePath}, returning empty array`);
      return [];
    }
    
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
};

// Helper function to write JSON file
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Product methods
const getAllProducts = () => {
  return readJsonFile(productsFile);
};

const findProductById = (id) => {
  const products = readJsonFile(productsFile);
  return products.find(product => product._id === id);
};

// Enhanced product validation
const validateProductData = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Product price must be greater than 0');
  }
  
  if (product.stock < 0) {
    errors.push('Product stock cannot be negative');
  }
  
  if (!product.category) {
    errors.push('Product category is required');
  }
  
  return errors;
};

// Enhanced createProduct with validation
const createProductWithValidation = (productData) => {
  const errors = validateProductData(productData);
  if (errors.length > 0) {
    throw new Error(`Product validation failed: ${errors.join(', ')}`);
  }
  
  return createProduct(productData);
};

// Stock management functions (moved to comprehensive inventory section below)

// Archive demo data
const archiveDemoData = () => {
  const products = readJsonFile(productsFile);
  const demoProducts = products.filter(product => 
    product.name.toLowerCase().includes('test') || 
    product.name.toLowerCase().includes('demo')
  );
  
  if (demoProducts.length > 0) {
    // Create archive file if it doesn't exist
    const archiveFile = path.join(__dirname, 'data', 'archived_products.json');
    if (!fs.existsSync(archiveFile)) {
      fs.writeFileSync(archiveFile, JSON.stringify([], null, 2));
    }
    
    const archived = readJsonFile(archiveFile);
    archived.push(...demoProducts.map(p => ({ ...p, archivedAt: new Date().toISOString() })));
    writeJsonFile(archiveFile, archived);
    
    // Remove demo products from main file
    const cleanProducts = products.filter(product => 
      !product.name.toLowerCase().includes('test') && 
      !product.name.toLowerCase().includes('demo')
    );
    writeJsonFile(productsFile, cleanProducts);
    
    console.log(`Archived ${demoProducts.length} demo products`);
  }
};

const createProduct = (productData) => {
  const products = readJsonFile(productsFile);
  
  // Check for duplicate products based on name, category, and brand
  // Only check for duplicates if all three fields are provided and non-empty
  const duplicateProduct = products.find(p => 
    p.name.toLowerCase().trim() === productData.name.toLowerCase().trim() &&
    (productData.category && p.category === productData.category) &&
    (productData.brand && p.brand === productData.brand)
  );
  
  if (duplicateProduct) {
    throw new Error(`A product with the same name "${productData.name}" already exists in the same category with the same brand. Please use a different name or edit the existing product.`);
  }
  
  const newProduct = {
    _id: `PROD${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
    ...productData,
    // Only mark as new if explicitly set by user, otherwise default to false
    isNew: productData.isNew === true || productData.isNew === 'true',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  products.push(newProduct);
  writeJsonFile(productsFile, products);
  return newProduct;
};

const updateProduct = (id, updateData) => {
  const products = readJsonFile(productsFile);
  const index = products.findIndex(product => product._id === id);
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile(productsFile, products);
    return products[index];
  }
  return null;
};

// Category methods
const getAllCategories = () => {
  return readJsonFile(categoriesFile);
};

const findCategoryById = (id) => {
  const categories = readJsonFile(categoriesFile);
  return categories.find(category => category._id === id);
};

const createCategory = (categoryData) => {
  const categories = readJsonFile(categoriesFile);
  const newCategory = {
    _id: `cat_${Date.now()}${Math.random().toString(36).substr(2, 3)}`,
    ...categoryData,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  categories.push(newCategory);
  writeJsonFile(categoriesFile, categories);
  return newCategory;
};

const updateCategory = (id, updateData) => {
  const categories = readJsonFile(categoriesFile);
  const index = categories.findIndex(category => category._id === id);
  if (index !== -1) {
    categories[index] = {
      ...categories[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile(categoriesFile, categories);
    return categories[index];
  }
  return null;
};

const deleteCategory = (id) => {
  console.log("Database deleteCategory called with ID:", id);
  const categories = readJsonFile(categoriesFile);
  console.log("Total categories before delete:", categories.length);
  
  const filteredCategories = categories.filter(category => category._id !== id);
  console.log("Total categories after filter:", filteredCategories.length);
  
  if (filteredCategories.length === categories.length) {
    console.log("No category found with ID:", id);
    return false;
  }
  
  writeJsonFile(categoriesFile, filteredCategories);
  console.log("Category deleted successfully");
  return true;
};

const getProductsByCategory = (categoryId) => {
  const products = readJsonFile(productsFile);
  return products.filter(product => product.category === categoryId);
};

const deleteProduct = (id) => {
  const products = readJsonFile(productsFile);
  const filteredProducts = products.filter(product => product._id !== id);
  writeJsonFile(productsFile, filteredProducts);
  return true;
};

// User methods
const getAllUsers = () => {
  return readJsonFile(usersFile);
};

const findUserById = (id) => {
  try {
    const users = readJsonFile(usersFile);
    return users.find(user => user._id === id);
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

const findUserByEmail = (email) => {
  try {
    const users = readJsonFile(usersFile);
    return users.find(user => user.email === email);
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

const createUser = (userData) => {
  try {
    const users = readJsonFile(usersFile);
    const newUser = {
      _id: `USER${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    writeJsonFile(usersFile, users);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
};

const updateUser = (id, updateData) => {
  try {
    const users = readJsonFile(usersFile);
    const index = users.findIndex(user => user._id === id);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJsonFile(usersFile, users);
      return users[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};

const deleteUser = (id) => {
  try {
    const users = readJsonFile(usersFile);
    const filteredUsers = users.filter(user => user._id !== id);
    writeJsonFile(usersFile, filteredUsers);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};

// Review methods
const getAllReviews = () => {
  return readJsonFile(reviewsFile);
};

const findReviewById = (id) => {
  const reviews = readJsonFile(reviewsFile);
  return reviews.find(review => review._id === id);
};

const createReview = (reviewData) => {
  const reviews = readJsonFile(reviewsFile);
  const newReview = {
    _id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    ...reviewData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  reviews.push(newReview);
  writeJsonFile(reviewsFile, reviews);
  return newReview;
};

const updateReview = (id, updateData) => {
  const reviews = readJsonFile(reviewsFile);
  const index = reviews.findIndex(review => review._id === id);
  if (index !== -1) {
    reviews[index] = {
      ...reviews[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile(reviewsFile, reviews);
    return reviews[index];
  }
  return null;
};

const deleteReview = (id) => {
  const reviews = readJsonFile(reviewsFile);
  const filteredReviews = reviews.filter(review => review._id !== id);
  writeJsonFile(reviewsFile, filteredReviews);
  return true;
};

const getReviewsByProduct = (productId) => {
  const reviews = readJsonFile(reviewsFile);
  return reviews.filter(review => review.productId === productId);
};

const getReviewsByUser = (userId) => {
  const reviews = readJsonFile(reviewsFile);
  return reviews.filter(review => review.userId === userId);
};

// Team member methods
const getAllTeamMembers = () => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  return data.teamMembers || [];
};

const findTeamMemberById = (id) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const teamMembers = data.teamMembers || [];
  return teamMembers.find(member => member.id === id);
};

const createTeamMember = (memberData) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  if (!data.teamMembers) {
    data.teamMembers = [];
  }
  
  const newMember = {
    id: `team_${Date.now()}`,
    ...memberData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.teamMembers.push(newMember);
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return newMember;
};

const updateTeamMember = (id, updateData) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const teamMembers = data.teamMembers || [];
  const memberIndex = teamMembers.findIndex(member => member.id === id);
  
  if (memberIndex === -1) {
    throw new Error('Team member not found');
  }
  
  teamMembers[memberIndex] = {
    ...teamMembers[memberIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  data.teamMembers = teamMembers;
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return teamMembers[memberIndex];
};

const deleteTeamMember = (id) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const teamMembers = data.teamMembers || [];
  const memberIndex = teamMembers.findIndex(member => member.id === id);
  
  if (memberIndex === -1) {
    throw new Error('Team member not found');
  }
  
  const deletedMember = teamMembers.splice(memberIndex, 1)[0];
  data.teamMembers = teamMembers;
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return deletedMember;
};

// Contact methods
const getAllContacts = () => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  return data.contacts || [];
};

const findContactById = (id) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const contacts = data.contacts || [];
  return contacts.find(contact => contact.id === id);
};

const createContact = (contactData) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  if (!data.contacts) {
    data.contacts = [];
  }
  
  const newContact = {
    id: `contact_${Date.now()}`,
    ...contactData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.contacts.push(newContact);
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return newContact;
};

const updateContact = (id, updateData) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const contacts = data.contacts || [];
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  
  if (contactIndex === -1) {
    throw new Error('Contact not found');
  }
  
  contacts[contactIndex] = {
    ...contacts[contactIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  data.contacts = contacts;
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return contacts[contactIndex];
};

const deleteContact = (id) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const contacts = data.contacts || [];
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  
  if (contactIndex === -1) {
    throw new Error('Contact not found');
  }
  
  const deletedContact = contacts.splice(contactIndex, 1)[0];
  data.contacts = contacts;
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return deletedContact;
};

// Hidden section methods
const getAllHiddenSections = () => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  return data.hiddenSections || [];
};

const findHiddenSectionById = (id) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const hiddenSections = data.hiddenSections || [];
  return hiddenSections.find(section => section.id === id);
};

const createHiddenSection = (sectionData) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  if (!data.hiddenSections) {
    data.hiddenSections = [];
  }
  
  const newHiddenSection = {
    id: `hidden_${Date.now()}`,
    ...sectionData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.hiddenSections.push(newHiddenSection);
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return newHiddenSection;
};

const updateHiddenSection = (id, updateData) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const hiddenSections = data.hiddenSections || [];
  const sectionIndex = hiddenSections.findIndex(section => section.id === id);
  
  if (sectionIndex === -1) {
    throw new Error('Hidden section not found');
  }
  
  hiddenSections[sectionIndex] = {
    ...hiddenSections[sectionIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  data.hiddenSections = hiddenSections;
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return hiddenSections[sectionIndex];
};

const deleteHiddenSection = (id) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const hiddenSections = data.hiddenSections || [];
  const sectionIndex = hiddenSections.findIndex(section => section.id === id);
  
  if (sectionIndex === -1) {
    throw new Error('Hidden section not found');
  }
  
  const deletedSection = hiddenSections.splice(sectionIndex, 1)[0];
  data.hiddenSections = hiddenSections;
  writeJsonFile(path.join(dataDir, 'data.json'), data);
  return deletedSection;
};

const isSectionHidden = (pagePath, sectionName) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const hiddenSections = data.hiddenSections || [];
  
  return hiddenSections.some(section => 
    section.isHidden && 
    (section.pagePath === 'all' || section.pagePath === pagePath) &&
    section.sectionName === sectionName
  );
};

const getVisibleSectionsForPage = (pagePath) => {
  const data = readJsonFile(path.join(dataDir, 'data.json'));
  const hiddenSections = data.hiddenSections || [];
  
  // Get all hidden sections for this page
  const hiddenForPage = hiddenSections.filter(section => 
    section.isHidden && 
    (section.pagePath === 'all' || section.pagePath === pagePath)
  );
  
  // Return sections that are NOT hidden
  const allSections = [
    'hero', 'categories', 'products', 'testimonials', 'newsletter', 'footer',
    'navbar', 'sidebar', 'banner', 'features', 'about', 'contact', 'team'
  ];
  
  return allSections.filter(section => 
    !hiddenForPage.some(hidden => hidden.sectionName === section)
  );
};

// Order methods
const getAllOrders = () => {
  return readJsonFile(ordersFile);
};

const findOrderById = (id) => {
  const orders = readJsonFile(ordersFile);
  return orders.find(order => order._id === id);
};

const findOrderByTracking = (trackingNumber) => {
  const orders = readJsonFile(ordersFile);
  return orders.find(order => order.trackingNumber === trackingNumber);
};

const getOrdersByUser = (userId) => {
  const orders = readJsonFile(ordersFile);
  return orders.filter(order => order.user === userId);
};

const createOrder = (orderData) => {
  const orders = readJsonFile(ordersFile);
  const newOrder = {
    _id: `ORD${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
    ...orderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  orders.push(newOrder);
  writeJsonFile(ordersFile, orders);
  return newOrder;
};

const updateOrder = (id, updateData) => {
  const orders = readJsonFile(ordersFile);
  const index = orders.findIndex(order => order._id === id);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile(ordersFile, orders);
    return orders[index];
  }
  return null;
};

const deleteOrder = (id) => {
  const orders = readJsonFile(ordersFile);
  const filteredOrders = orders.filter(order => order._id !== id);
  writeJsonFile(ordersFile, filteredOrders);
  return true;
};

// Analytics methods
const getAnalyticsWithRange = (days = 30) => {
  const orders = readJsonFile(ordersFile);
  const products = readJsonFile(productsFile);
  const users = readJsonFile(usersFile);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentOrders = orders.filter(order => 
    new Date(order.createdAt) >= cutoffDate
  );
  
  const totalRevenue = recentOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = recentOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Daily revenue for the last 7 days
  const dailyRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayOrders = recentOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });
    
    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    dailyRevenue.push({
      date: dayStart.toISOString().split('T')[0],
      revenue: dayRevenue,
      orders: dayOrders.length
    });
  }
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    totalProducts: products.length,
    totalUsers: users.length,
    dailyRevenue,
    topProducts: getTopProducts(products, recentOrders),
    orderStatusDistribution: getOrderStatusDistribution(recentOrders)
  };
};

const getTopProducts = (products, orders) => {
  const productSales = {};
  
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (productSales[item._id]) {
        productSales[item._id].quantity += item.quantity;
        productSales[item._id].revenue += item.price * item.quantity;
      } else {
        productSales[item._id] = {
          quantity: item.quantity,
          revenue: item.price * item.quantity
        };
      }
    });
  });
  
  return Object.entries(productSales)
    .map(([productId, sales]) => {
      const product = products.find(p => p._id === productId);
      return {
        _id: productId,
        name: product ? product.name : 'Unknown Product',
        quantity: sales.quantity,
        revenue: sales.revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

const getOrderStatusDistribution = (orders) => {
  const statusCount = {};
  orders.forEach(order => {
    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
  });
  return statusCount;
};

const getInventory = () => {
  const products = readJsonFile(productsFile);
  const orders = readJsonFile(ordersFile);
  
  return products.map(product => {
    const stock = product.stock || 0;
    const minStock = product.minStock || 5;
    const maxStock = product.maxStock || 100;
    
    // Calculate stock status
    let status = 'In Stock';
    if (stock === 0) {
      status = 'Out of Stock';
    } else if (stock <= minStock) {
      status = 'Low Stock';
    }
    
    // Calculate total sales for this product
    const productOrders = orders.filter(order => 
      order.orderItems && order.orderItems.some(item => item.product === product._id)
    );
    
    const totalSold = productOrders.reduce((total, order) => {
      const item = order.orderItems.find(item => item.product === product._id);
      return total + (item ? item.quantity : 0);
    }, 0);
    
    // Calculate revenue for this product
    const revenue = productOrders.reduce((total, order) => {
      const item = order.orderItems.find(item => item.product === product._id);
      return total + (item ? item.quantity * product.price : 0);
    }, 0);
    
    // Calculate cost (assuming 30% margin)
    const cost = product.price * 0.7;
    
    // Calculate last sold date
    const lastSoldOrder = productOrders
      .filter(order => order.status === 'delivered' || order.status === 'completed')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    
    return {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      subCategory: product.subCategory,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      offerPrice: product.offerPrice,
      cost: cost,
      stock: stock,
      minStock: minStock,
      maxStock: maxStock,
      supplier: product.supplier,
      location: product.location,
      status: status,
      lowStock: stock <= minStock && stock > 0,
      outOfStock: stock === 0,
      totalSold: totalSold,
      revenue: revenue,
      profit: revenue - (cost * totalSold),
      lastSold: lastSoldOrder ? lastSoldOrder.createdAt : null,
      lastUpdated: product.updatedAt || product.createdAt,
      description: product.description,
      images: product.images,
      specifications: product.specifications,
      isActive: product.isActive,
      notes: product.notes
    };
  });
};

const getReports = () => {
  const orders = readJsonFile(ordersFile);
  const products = readJsonFile(productsFile);
  const users = readJsonFile(usersFile);
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = users.length;
  
  const monthlyRevenue = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toISOString().slice(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalPrice;
  });
  
  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
    monthlyRevenue,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
  };
};

// Update product stock
const updateProductStock = (productId, newStock, operation = 'set') => {
  const products = readJsonFile(productsFile);
  const productIndex = products.findIndex(p => p._id === productId);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  
  const currentStock = products[productIndex].stock || 0;
  let updatedStock;
  
  switch (operation) {
    case 'add':
      updatedStock = currentStock + newStock;
      break;
    case 'subtract':
      updatedStock = Math.max(0, currentStock - newStock);
      break;
    case 'set':
    default:
      updatedStock = Math.max(0, newStock);
      break;
  }
  
  products[productIndex].stock = updatedStock;
  products[productIndex].updatedAt = new Date().toISOString();
  
  writeJsonFile(productsFile, products);
  return products[productIndex];
};

// Bulk update stock
const bulkUpdateStock = (updates) => {
  const products = readJsonFile(productsFile);
  const updatedProducts = [];
  
  updates.forEach(update => {
    const productIndex = products.findIndex(p => p._id === update.productId);
    if (productIndex !== -1) {
      const currentStock = products[productIndex].stock || 0;
      let updatedStock;
      
      switch (update.operation) {
        case 'add':
          updatedStock = currentStock + update.quantity;
          break;
        case 'subtract':
          updatedStock = Math.max(0, currentStock - update.quantity);
          break;
        case 'set':
        default:
          updatedStock = Math.max(0, update.quantity);
          break;
      }
      
      products[productIndex].stock = updatedStock;
      products[productIndex].updatedAt = new Date().toISOString();
      updatedProducts.push(products[productIndex]);
    }
  });
  
  writeJsonFile(productsFile, products);
  return updatedProducts;
};

// Get low stock products
const getLowStockProducts = () => {
  const inventory = getInventory();
  return inventory.filter(item => item.lowStock);
};

// Get out of stock products
const getOutOfStockProducts = () => {
  const inventory = getInventory();
  return inventory.filter(item => item.outOfStock);
};

// Get inventory summary
const getInventorySummary = () => {
  const inventory = getInventory();
  const totalProducts = inventory.length;
  const inStock = inventory.filter(item => item.status === 'In Stock').length;
  const lowStock = inventory.filter(item => item.status === 'Low Stock').length;
  const outOfStock = inventory.filter(item => item.status === 'Out of Stock').length;
  
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);
  const totalRevenue = inventory.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = inventory.reduce((sum, item) => sum + item.profit, 0);
  
  return {
    totalProducts,
    inStock,
    lowStock,
    outOfStock,
    totalValue,
    totalRevenue,
    totalProfit,
    lowStockPercentage: totalProducts > 0 ? (lowStock / totalProducts) * 100 : 0,
    outOfStockPercentage: totalProducts > 0 ? (outOfStock / totalProducts) * 100 : 0
  };
};

const generateReport = (type, dateRange) => {
  const orders = readJsonFile(ordersFile);
  const products = readJsonFile(productsFile);
  
  let filteredOrders = orders;
  if (dateRange) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  switch (type) {
    case 'sales':
      return {
        type: 'Sales Report',
        dateRange,
        totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0),
        totalOrders: filteredOrders.length,
        orders: filteredOrders
      };
    case 'inventory':
      return {
        type: 'Inventory Report',
        totalProducts: products.length,
        inStock: products.filter(p => (p.stock || 0) > 0).length,
        outOfStock: products.filter(p => (p.stock || 0) === 0).length,
        lowStock: products.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length,
        products: products
      };
    default:
      return null;
  }
};

// Get product by ID (alias for findProductById)
const getProductById = (id) => {
  return findProductById(id);
};

// Mark old products as not new (after 30 days)
const markOldProductsAsNotNew = () => {
  const products = readJsonFile(productsFile);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let updated = false;
  products.forEach(product => {
    if (product.isNew && new Date(product.createdAt) < thirtyDaysAgo) {
      product.isNew = false;
      updated = true;
    }
  });
  
  if (updated) {
    writeJsonFile(productsFile, products);
  }
  
  return updated;
};

// Get new products (recently added)
const getNewProducts = (limit = 10) => {
  const products = readJsonFile(productsFile);
  return products
    .filter(product => product.isNew === true)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

// Get featured products
const getFeaturedProducts = (limit = 10) => {
  const products = readJsonFile(productsFile);
  return products.filter(product => product.featured).slice(0, limit);
};

// Search products
const searchProducts = (query, limit = 10) => {
  const products = readJsonFile(productsFile);
  const searchLower = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchLower) ||
    product.description?.toLowerCase().includes(searchLower) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
  ).slice(0, limit);
};

// Count documents
const countDocuments = () => {
  const products = readJsonFile(productsFile);
  return products.length;
};

// Count documents by category
const countDocumentsByCategory = (categoryId) => {
  const products = readJsonFile(productsFile);
  return products.filter(product => product.category === categoryId).length;
};

// Aggregate function (simplified for file-based storage)
const aggregate = (pipeline) => {
  const products = readJsonFile(productsFile);
  
  // Handle simple aggregation like sum of viewCount
  if (pipeline[0]?.$group?._id === null && pipeline[0]?.$group?.totalViews?.$sum === '$viewCount') {
    const totalViews = products.reduce((sum, product) => sum + (product.viewCount || 0), 0);
    return [{ totalViews }];
  }
  
  return [];
};

// Weight Options methods
const getAllWeightOptions = () => {
  return readJsonFile(weightOptionsFile);
};

const findWeightOptionById = (id) => {
  const weightOptions = readJsonFile(weightOptionsFile);
  return weightOptions.find(option => option._id === id);
};

const createWeightOption = (weightOptionData) => {
  const weightOptions = readJsonFile(weightOptionsFile);
  const newWeightOption = {
    _id: Date.now().toString(),
    ...weightOptionData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  weightOptions.push(newWeightOption);
  writeJsonFile(weightOptionsFile, weightOptions);
  return newWeightOption;
};

const updateWeightOption = (id, updateData) => {
  const weightOptions = readJsonFile(weightOptionsFile);
  const index = weightOptions.findIndex(option => option._id === id);
  if (index !== -1) {
    weightOptions[index] = {
      ...weightOptions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile(weightOptionsFile, weightOptions);
    return weightOptions[index];
  }
  return null;
};

const deleteWeightOption = (id) => {
  const weightOptions = readJsonFile(weightOptionsFile);
  const filteredOptions = weightOptions.filter(option => option._id !== id);
  writeJsonFile(weightOptionsFile, filteredOptions);
  return true;
};

const getWeightOptionsByCategory = (category) => {
  const weightOptions = readJsonFile(weightOptionsFile);
  return weightOptions
    .filter(option => option.category === category && option.isActive)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.weight.localeCompare(b.weight));
};

const createDefaultWeightOptions = () => {
  const defaultOptions = [
    // Cake weight options
    { name: 'Small Cake', weight: '0.5', basePrice: 299, servingSize: '2-3 People', category: 'cakes', displayOrder: 1, description: 'Perfect for small celebrations', isActive: true, multiplier: 1 },
    { name: 'Medium Cake', weight: '1', basePrice: 499, servingSize: 'Serves 4-6', category: 'cakes', displayOrder: 2, description: 'Ideal for family gatherings', isActive: true, multiplier: 1 },
    { name: 'Large Cake', weight: '1.5', basePrice: 699, servingSize: '6-8 People', category: 'cakes', displayOrder: 3, description: 'Great for parties', isActive: true, multiplier: 1 },
    { name: 'Extra Large Cake', weight: '2', basePrice: 899, servingSize: '8-10 People', category: 'cakes', displayOrder: 4, description: 'Perfect for big celebrations', isActive: true, multiplier: 1 },
    
    // Dessert weight options
    { name: 'Small Dessert', weight: '0.25', basePrice: 149, servingSize: '1-2 People', category: 'desserts', displayOrder: 1, description: 'Perfect for one or two people', isActive: true, multiplier: 1 },
    { name: 'Medium Dessert', weight: '0.5', basePrice: 249, servingSize: '2-3 People', category: 'desserts', displayOrder: 2, description: 'Ideal for sharing', isActive: true, multiplier: 1 },
    { name: 'Large Dessert', weight: '1', basePrice: 399, servingSize: 'Serves 4-6', category: 'desserts', displayOrder: 3, description: 'Great for family', isActive: true, multiplier: 1 },
    
    // Pastry weight options
    { name: 'Small Pastry', weight: '0.3', basePrice: 99, servingSize: '1 Person', category: 'pastries', displayOrder: 1, description: 'Perfect for one person', isActive: true, multiplier: 1 },
    { name: 'Medium Pastry', weight: '0.6', basePrice: 179, servingSize: '2 People', category: 'pastries', displayOrder: 2, description: 'Ideal for sharing', isActive: true, multiplier: 1 },
    { name: 'Large Pastry', weight: '1', basePrice: 279, servingSize: '3-4 People', category: 'pastries', displayOrder: 3, description: 'Great for small groups', isActive: true, multiplier: 1 }
  ];

  // Check if any weight options exist
  const existingOptions = readJsonFile(weightOptionsFile);
  if (existingOptions.length === 0) {
    console.log('Creating default weight options...');
    const optionsWithIds = defaultOptions.map(option => ({
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...option,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    writeJsonFile(weightOptionsFile, optionsWithIds);
    console.log('Default weight options created successfully');
    return optionsWithIds;
  }
  
  return existingOptions;
};

export default {
  // Product methods
  getAllProducts,
  findProductById,
  getProductById, // Add alias
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts, // Add new function
  searchProducts, // Add new function
  getNewProducts, // Add new function
  markOldProductsAsNotNew, // Add new function
  
  // User methods
  getAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  
  // Order methods
  getAllOrders,
  findOrderById,
  getOrderById: findOrderById, // Add alias
  findOrderByTracking,
  getOrdersByUser,
  createOrder,
  updateOrder,
  deleteOrder,
  
  // Category methods
  getAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
  
  // Review methods
  getAllReviews,
  findReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewsByProduct,
  getReviewsByUser,
  
  // Analytics methods
  getAnalyticsWithRange,
  getInventory,
  updateProductStock,
  bulkUpdateStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventorySummary,
  getReports,
  generateReport,
  
  // Team member methods
  getAllTeamMembers,
  findTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  
  // Contact methods
  getAllContacts,
  findContactById,
  createContact,
  updateContact,
  deleteContact,
  
  // Hidden section methods
  getAllHiddenSections,
  findHiddenSectionById,
  createHiddenSection,
  updateHiddenSection,
  deleteHiddenSection,
  isSectionHidden,
  getVisibleSectionsForPage,
  
  // Additional methods
  countDocuments, // Add new function
  countDocumentsByCategory, // Add new function
  aggregate, // Add new function
  
  // Offer popup methods
  getOfferPopups: () => readJsonFile(offerPopupsFile),
  findOfferPopupById: (id) => {
    const popups = readJsonFile(offerPopupsFile);
    return popups.find(popup => popup._id === id);
  },
  createOfferPopup: (popupData) => {
    const popups = readJsonFile(offerPopupsFile);
    const newPopup = {
      ...popupData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    popups.push(newPopup);
    writeJsonFile(offerPopupsFile, popups);
    return newPopup;
  },
  updateOfferPopup: (id, updateData) => {
    const popups = readJsonFile(offerPopupsFile);
    const index = popups.findIndex(popup => popup._id === id);
    if (index !== -1) {
      popups[index] = { ...popups[index], ...updateData, updatedAt: new Date().toISOString() };
      writeJsonFile(offerPopupsFile, popups);
      return popups[index];
    }
    return null;
  },
  deleteOfferPopup: (id) => {
    const popups = readJsonFile(offerPopupsFile);
    const filteredPopups = popups.filter(popup => popup._id !== id);
    writeJsonFile(offerPopupsFile, filteredPopups);
    return true;
  },

  // Menu item methods
  getAllMenuItems: () => readJsonFile(menuItemsFile),
  findMenuItemById: (id) => {
    const menuItems = readJsonFile(menuItemsFile);
    return menuItems.find(item => item._id === id);
  },
  createMenuItem: (menuItemData) => {
    const menuItems = readJsonFile(menuItemsFile);
    const newMenuItem = {
      _id: `menu_${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      ...menuItemData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    menuItems.push(newMenuItem);
    writeJsonFile(menuItemsFile, menuItems);
    return newMenuItem;
  },
  updateMenuItem: (id, updateData) => {
    const menuItems = readJsonFile(menuItemsFile);
    const index = menuItems.findIndex(item => item._id === id);
    if (index !== -1) {
      menuItems[index] = {
        ...menuItems[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJsonFile(menuItemsFile, menuItems);
      return menuItems[index];
    }
    return null;
  },
  deleteMenuItem: (id) => {
    const menuItems = readJsonFile(menuItemsFile);
    const filteredMenuItems = menuItems.filter(item => item._id !== id);
    writeJsonFile(menuItemsFile, filteredMenuItems);
    return true;
  },
  
  // Weight Options methods
  getAllWeightOptions,
  findWeightOptionById,
  createWeightOption,
  updateWeightOption,
  deleteWeightOption,
  getWeightOptionsByCategory,
  createDefaultWeightOptions
};
