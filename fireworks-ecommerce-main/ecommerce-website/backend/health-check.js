import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// System Health Check
export const systemHealthCheck = () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check 1: Environment Variables
  const requiredEnvVars = ['JWT_SECRET', 'PORT'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  health.checks.environment = {
    status: missingEnvVars.length === 0 ? 'pass' : 'fail',
    message: missingEnvVars.length === 0 ? 'All required environment variables present' : `Missing: ${missingEnvVars.join(', ')}`,
    missing: missingEnvVars
  };

  // Check 2: File System
  const uploadsDir = path.join(__dirname, 'uploads');
  const dataDir = path.join(__dirname, 'data');
  
  health.checks.filesystem = {
    status: 'pass',
    message: 'File system accessible',
    uploadsDir: fs.existsSync(uploadsDir),
    dataDir: fs.existsSync(dataDir)
  };

  // Check 3: Database Files
  const dbFiles = ['users.json', 'products.json', 'orders.json', 'banners.json'];
  const existingDbFiles = dbFiles.filter(file => 
    fs.existsSync(path.join(dataDir, file))
  );
  
  health.checks.database = {
    status: existingDbFiles.length > 0 ? 'pass' : 'warn',
    message: existingDbFiles.length > 0 ? 'Database files accessible' : 'No database files found',
    files: existingDbFiles
  };

  // Check 4: Payment Configuration
  const stripeConfigured = process.env.STRIPE_SECRET_KEY && 
    process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here';
  
  health.checks.payment = {
    status: stripeConfigured ? 'pass' : 'warn',
    message: stripeConfigured ? 'Stripe configured' : 'Stripe not configured - using fallback',
    stripe: stripeConfigured,
    fallback: 'COD available'
  };

  // Check 5: Email Configuration
  const emailConfigured = process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD;
  
  health.checks.email = {
    status: emailConfigured ? 'pass' : 'warn',
    message: emailConfigured ? 'Email service configured' : 'Email service not configured',
    smtp: emailConfigured
  };

  // Overall status
  const failedChecks = Object.values(health.checks).filter(check => check.status === 'fail');
  if (failedChecks.length > 0) {
    health.status = 'unhealthy';
  } else if (Object.values(health.checks).some(check => check.status === 'warn')) {
    health.status = 'degraded';
  }

  return health;
};

// Quick fix function
export const quickFix = () => {
  const fixes = [];
  
  // Create missing directories
  const uploadsDir = path.join(__dirname, 'uploads');
  const dataDir = path.join(__dirname, 'data');
  const bannersDir = path.join(uploadsDir, 'banners');
  const productsDir = path.join(uploadsDir, 'products');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    fixes.push('Created uploads directory');
  }
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    fixes.push('Created data directory');
  }
  
  if (!fs.existsSync(bannersDir)) {
    fs.mkdirSync(bannersDir, { recursive: true });
    fixes.push('Created banners directory');
  }
  
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
    fixes.push('Created products directory');
  }
  
  // Create missing database files
  const dbFiles = ['users.json', 'products.json', 'orders.json', 'banners.json'];
  dbFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      fixes.push(`Created ${file}`);
    }
  });
  
  return fixes;
};
