import QRCode from 'qrcode';

/**
 * Generate QR code for order details
 * @param {string} orderId - The order ID
 * @param {string} trackingNumber - The tracking number
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateOrderQRCode = async (orderId, trackingNumber) => {
  try {
    // Create the URL that will be displayed when QR code is scanned
    const orderDetailsUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-details/${orderId}?tracking=${trackingNumber}`;
    
    // Generate QR code options
    const qrOptions = {
      type: 'png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',  // QR code color
        light: '#FFFFFF'  // Background color
      },
      width: 200,
      errorCorrectionLevel: 'M'
    };

    // Generate QR code as base64 string
    const qrCodeDataURL = await QRCode.toDataURL(orderDetailsUrl, qrOptions);
    
    console.log('✅ QR Code generated for order:', orderId);
    console.log('🔗 QR Code URL:', orderDetailsUrl);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code for order tracking
 * @param {string} trackingNumber - The tracking number
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateTrackingQRCode = async (trackingNumber) => {
  try {
    // Create the URL for order tracking
    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${trackingNumber}`;
    
    const qrOptions = {
      type: 'png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#1e3c72',  // Brand color
        light: '#FFFFFF'
      },
      width: 200,
      errorCorrectionLevel: 'M'
    };

    const qrCodeDataURL = await QRCode.toDataURL(trackingUrl, qrOptions);
    
    console.log('✅ Tracking QR Code generated for:', trackingNumber);
    console.log('🔗 Tracking URL:', trackingUrl);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ Error generating tracking QR code:', error);
    throw new Error('Failed to generate tracking QR code');
  }
};

/**
 * Generate QR code with custom data
 * @param {string} data - The data to encode
 * @param {Object} options - QR code options
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateCustomQRCode = async (data, options = {}) => {
  try {
    const defaultOptions = {
      type: 'png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200,
      errorCorrectionLevel: 'M'
    };

    const qrOptions = { ...defaultOptions, ...options };
    const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ Error generating custom QR code:', error);
    throw new Error('Failed to generate custom QR code');
  }
};
