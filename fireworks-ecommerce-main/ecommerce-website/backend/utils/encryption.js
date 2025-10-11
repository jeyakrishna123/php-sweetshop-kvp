import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Generate encryption key from environment variable
const getEncryptionKey = () => {
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET or JWT_SECRET environment variable is required');
  }
  
  // Derive a consistent key from the secret
  return crypto.pbkdf2Sync(secret, 'fireworkshub-salt', ITERATIONS, KEY_LENGTH, 'sha512');
};

// Encrypt sensitive data
export const encryptData = (data) => {
  try {
    if (!data) return null;
    
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(salt);
    
    // Encrypt the data
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine all components
    const result = {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: tag.toString('hex'),
      version: '1.0'
    };
    
    return Buffer.from(JSON.stringify(result)).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt sensitive data
export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    
    const key = getEncryptionKey();
    const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
    
    // Extract components
    const { encrypted, iv, salt, tag, version } = data;
    
    if (version !== '1.0') {
      throw new Error('Unsupported encryption version');
    }
    
    // Create decipher
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(Buffer.from(salt, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Hash sensitive data (one-way encryption)
export const hashData = (data, salt = null) => {
  try {
    if (!data) return null;
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const useSalt = salt || crypto.randomBytes(16).toString('hex');
    
    const hash = crypto.pbkdf2Sync(dataString, useSalt, ITERATIONS, 64, 'sha512');
    
    return {
      hash: hash.toString('hex'),
      salt: useSalt
    };
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};

// Verify hashed data
export const verifyHash = (data, hash, salt) => {
  try {
    if (!data || !hash || !salt) return false;
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const computedHash = crypto.pbkdf2Sync(dataString, salt, ITERATIONS, 64, 'sha512');
    
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), computedHash);
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
};

// Encrypt specific fields in an object
export const encryptObjectFields = (obj, fieldsToEncrypt) => {
  try {
    const encrypted = { ...obj };
    
    fieldsToEncrypt.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = encryptData(encrypted[field]);
      }
    });
    
    return encrypted;
  } catch (error) {
    console.error('Object encryption error:', error);
    throw new Error('Failed to encrypt object fields');
  }
};

// Decrypt specific fields in an object
export const decryptObjectFields = (obj, fieldsToDecrypt) => {
  try {
    const decrypted = { ...obj };
    
    fieldsToDecrypt.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        decrypted[field] = decryptData(decrypted[field]);
      }
    });
    
    return decrypted;
  } catch (error) {
    console.error('Object decryption error:', error);
    throw new Error('Failed to decrypt object fields');
  }
};

// Generate secure random string
export const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secure random number
export const generateSecureNumber = (min = 100000, max = 999999) => {
  const range = max - min + 1;
  const bytes = crypto.randomBytes(4);
  const value = bytes.readUInt32BE(0);
  return min + (value % range);
};

// Encrypt credit card data (PCI DSS compliant)
export const encryptCreditCard = (cardData) => {
  try {
    const { number, cvv, expiryMonth, expiryYear } = cardData;
    
    // Only store last 4 digits in plain text for display
    const lastFour = number.slice(-4);
    
    // Encrypt full card number
    const encryptedNumber = encryptData(number);
    
    // Hash CVV (never store in plain text)
    const hashedCvv = hashData(cvv);
    
    return {
      lastFour,
      encryptedNumber,
      hashedCvv: hashedCvv.hash,
      cvvSalt: hashedCvv.salt,
      expiryMonth,
      expiryYear,
      encrypted: true
    };
  } catch (error) {
    console.error('Credit card encryption error:', error);
    throw new Error('Failed to encrypt credit card data');
  }
};

// Verify credit card CVV
export const verifyCreditCardCvv = (storedCard, cvv) => {
  try {
    return verifyHash(cvv, storedCard.hashedCvv, storedCard.cvvSalt);
  } catch (error) {
    console.error('CVV verification error:', error);
    return false;
  }
};

// Encrypt personal information
export const encryptPersonalInfo = (personalData) => {
  const fieldsToEncrypt = ['ssn', 'passportNumber', 'driversLicense', 'phone', 'address'];
  return encryptObjectFields(personalData, fieldsToEncrypt);
};

// Decrypt personal information
export const decryptPersonalInfo = (encryptedData) => {
  const fieldsToDecrypt = ['ssn', 'passportNumber', 'driversLicense', 'phone', 'address'];
  return decryptObjectFields(encryptedData, fieldsToDecrypt);
};

// Secure data masking for logging
export const maskSensitiveData = (data, fieldsToMask) => {
  try {
    const masked = { ...data };
    
    fieldsToMask.forEach(field => {
      if (masked[field] && typeof masked[field] === 'string') {
        const length = masked[field].length;
        if (length > 4) {
          masked[field] = masked[field].substring(0, 2) + '*'.repeat(length - 4) + masked[field].substring(length - 2);
        } else {
          masked[field] = '*'.repeat(length);
        }
      }
    });
    
    return masked;
  } catch (error) {
    console.error('Data masking error:', error);
    return data;
  }
};

// Export all encryption utilities
export default {
  encryptData,
  decryptData,
  hashData,
  verifyHash,
  encryptObjectFields,
  decryptObjectFields,
  generateSecureString,
  generateSecureNumber,
  encryptCreditCard,
  verifyCreditCardCvv,
  encryptPersonalInfo,
  decryptPersonalInfo,
  maskSensitiveData
};
