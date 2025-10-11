// Security Configuration for FireworksHub E-commerce Platform

export const securityConfig = {
  // Authentication & Authorization
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtCookieExpire: process.env.JWT_COOKIE_EXPIRE || 7,
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    requireLowercase: true
  },

  // Rate Limiting
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      skipSuccessfulRequests: true
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 requests per window
      skipSuccessfulRequests: false
    },
    admin: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      skipSuccessfulRequests: false
    },
    payment: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 payment attempts per hour
      skipSuccessfulRequests: false
    }
  },

  // Speed Limiting
  speedLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // Allow 100 requests per 15 minutes without delay
    delayMs: 500, // Add 500ms delay per request after limit
    maxDelayMs: 20000 // Maximum delay of 20 seconds
  },

  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'X-CSRF-Token',
      'X-API-Key'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Rate-Limit-Remaining']
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "blob:", 
        "https://res.cloudinary.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://js.stripe.com", 
        "https://checkout.stripe.com"
      ],
      connectSrc: [
        "'self'", 
        "https://api.stripe.com", 
        "https://checkout.stripe.com"
      ],
      frameSrc: [
        "'self'", 
        "https://js.stripe.com", 
        "https://checkout.stripe.com"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },

  // Security Headers
  headers: {
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'DENY',
    xXSSProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=()',
    xDNSPrefetchControl: 'off',
    xDownloadOptions: 'noopen',
    xPermittedCrossDomainPolicies: 'none'
  },

  // Input Validation
  validation: {
    maxBodySize: 10000, // Maximum request body size in characters
    maxQueryLength: 1000, // Maximum query string length
    maxUrlLength: 2048, // Maximum URL length
    allowedContentTypes: ['application/json', 'multipart/form-data'],
    sanitizeInputs: true,
    validateFileTypes: true,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },

  // File Upload Security
  fileUpload: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    scanForViruses: true,
    validateImageDimensions: true,
    maxWidth: 4000,
    maxHeight: 4000,
    stripMetadata: true
  },

  // Database Security
  database: {
    sanitizeQueries: true,
    preventInjection: true,
    encryptSensitiveFields: true,
    backupEncryption: true,
    connectionLimit: 10,
    idleTimeout: 60000,
    acquireTimeout: 60000
  },

  // Session Security
  session: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    rolling: true,
    resave: false,
    saveUninitialized: false
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    iterations: 100000,
    encryptSensitiveData: true,
    fieldsToEncrypt: [
      'creditCardNumber',
      'ssn',
      'passportNumber',
      'phone',
      'address'
    ]
  },

  // Logging & Monitoring
  logging: {
    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: './logs/security.log',
    logSuspiciousActivity: true,
    logFailedAttempts: true,
    logAdminActions: true,
    maskSensitiveData: true,
    fieldsToMask: [
      'password',
      'creditCardNumber',
      'ssn',
      'token',
      'apiKey'
    ]
  },

  // IP Filtering
  ipFilter: {
    enableWhitelist: false,
    enableBlacklist: true,
    whitelistedIPs: [
      // Add trusted IPs here
    ],
    blacklistedIPs: [
      // Add known malicious IPs here
    ],
    geoBlocking: false,
    blockedCountries: []
  },

  // API Security
  api: {
    requireApiKey: false,
    apiKeyHeader: 'X-API-Key',
    versioning: true,
    deprecationWarnings: true,
    requestIdTracking: true,
    responseTimeLogging: true
  },

  // Payment Security (PCI DSS Compliance)
  payment: {
    pciCompliant: true,
    encryptCardData: true,
    tokenizeCards: true,
    maskDisplayData: true,
    secureTransmission: true,
    auditLogging: true,
    fraudDetection: true
  },

  // Backup & Recovery
  backup: {
    encryptBackups: true,
    secureStorage: true,
    retentionPolicy: 30, // days
    testRestore: true,
    offsiteBackup: true
  },

  // Environment-specific settings
  environment: {
    development: {
      debugMode: true,
      verboseLogging: true,
      relaxedSecurity: true
    },
    production: {
      debugMode: false,
      verboseLogging: false,
      relaxedSecurity: false,
      forceHTTPS: true,
      strictCSP: true
    }
  }
};

// Security middleware configuration
export const middlewareConfig = {
  // Order of middleware application
  order: [
    'helmet',
    'cors',
    'securityHeaders',
    'rateLimit',
    'speedLimit',
    'sanitizeRequest',
    'validateInput',
    'securityLogger',
    'ipFilter',
    'sessionSecurity',
    'bodyParser',
    'cookieParser',
    'routes'
  ],

  // Conditional middleware based on environment
  conditional: {
    development: [
      'debugMiddleware',
      'detailedErrorLogging'
    ],
    production: [
      'compression',
      'minimalErrorLogging'
    ]
  }
};

// Security monitoring configuration
export const monitoringConfig = {
  // Real-time monitoring
  realtime: {
    enabled: true,
    alertThresholds: {
      failedLogins: 10,
      suspiciousRequests: 5,
      highLatency: 2000, // ms
      errorRate: 0.05 // 5%
    },
    notificationChannels: ['email', 'slack', 'webhook']
  },

  // Security metrics
  metrics: {
    trackFailedAttempts: true,
    trackSuspiciousActivity: true,
    trackPerformanceMetrics: true,
    trackUserBehavior: true,
    retentionPeriod: 90 // days
  },

  // Automated responses
  automated: {
    blockSuspiciousIPs: true,
    lockoutAccounts: true,
    notifyAdmins: true,
    generateReports: true
  }
};

export default {
  securityConfig,
  middlewareConfig,
  monitoringConfig
};
