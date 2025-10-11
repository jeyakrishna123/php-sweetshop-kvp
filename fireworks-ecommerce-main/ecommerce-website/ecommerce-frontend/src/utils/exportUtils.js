// Export/Import utilities for admin panel

// Export data to CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export products to CSV
export const exportProducts = (products) => {
  const exportData = products.map(product => ({
    ID: product._id,
    Name: product.name,
    Price: product.price,
    Stock: product.stock,
    Category: product.category,
    Brand: product.brand,
    Featured: product.featured ? 'Yes' : 'No',
    'Is New': product.isNew ? 'Yes' : 'No',
    Description: product.description,
    'Created At': new Date(product.createdAt).toLocaleDateString()
  }));
  
  exportToCSV(exportData, `products_${new Date().toISOString().split('T')[0]}`);
};

// Export orders to CSV
export const exportOrders = (orders) => {
  const exportData = orders.map(order => ({
    'Order ID': order._id,
    'Customer': order.customerInfo?.name || 'N/A',
    'Email': order.customerInfo?.email || 'N/A',
    'Total': order.totalPrice,
    'Status': order.status,
    'Payment Method': order.paymentMethod,
    'Is Paid': order.isPaid ? 'Yes' : 'No',
    'Is Delivered': order.isDelivered ? 'Yes' : 'No',
    'Created At': new Date(order.createdAt).toLocaleDateString(),
    'Tracking Number': order.trackingNumber || 'N/A'
  }));
  
  exportToCSV(exportData, `orders_${new Date().toISOString().split('T')[0]}`);
};

// Export users to CSV
export const exportUsers = (users) => {
  const exportData = users.map(user => ({
    ID: user._id,
    Name: user.name,
    Email: user.email,
    Phone: user.phone,
    Role: user.role,
    'Is Verified': user.isVerified ? 'Yes' : 'No',
    'Is Active': user.isActive ? 'Yes' : 'No',
    'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
    'Created At': new Date(user.createdAt).toLocaleDateString()
  }));
  
  exportToCSV(exportData, `users_${new Date().toISOString().split('T')[0]}`);
};

// Import CSV file
export const importCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim().length > 0)
          .map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
        
        resolve({ headers, data });
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Validate imported product data
export const validateImportedProducts = (data) => {
  const errors = [];
  const validProducts = [];
  
  data.forEach((row, index) => {
    const rowErrors = [];
    
    if (!row.Name || row.Name.trim().length < 3) {
      rowErrors.push('Name must be at least 3 characters');
    }
    
    if (!row.Price || isNaN(parseFloat(row.Price)) || parseFloat(row.Price) <= 0) {
      rowErrors.push('Price must be a positive number');
    }
    
    if (!row.Category || row.Category.trim().length === 0) {
      rowErrors.push('Category is required');
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: index + 1, errors: rowErrors });
    } else {
      validProducts.push({
        name: row.Name.trim(),
        price: parseFloat(row.Price),
        stock: parseInt(row.Stock) || 0,
        category: row.Category.trim(),
        brand: row.Brand?.trim() || '',
        description: row.Description?.trim() || '',
        featured: row.Featured?.toLowerCase() === 'yes',
        isNew: row['Is New']?.toLowerCase() === 'yes'
      });
    }
  });
  
  return { errors, validProducts };
};

export default {
  exportToCSV,
  exportProducts,
  exportOrders,
  exportUsers,
  importCSV,
  validateImportedProducts
};
