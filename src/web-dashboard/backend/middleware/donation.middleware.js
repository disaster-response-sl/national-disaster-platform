// Validation middleware for donation endpoints

const validateDonationConfirmation = (req, res, next) => {
  const { name, email, phone, amount, orderId, transactionId, sessionId, status } = req.body;
  const errors = [];

  // Validate required fields
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Valid email is required');
    }
  }

  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    errors.push('Phone number is required');
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount is required and must be a positive number');
  }

  if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
    errors.push('Order ID is required');
  }

  if (!transactionId || typeof transactionId !== 'string' || !transactionId.trim()) {
    errors.push('Transaction ID is required');
  }

  if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
    errors.push('Session ID is required');
  }

  if (!status || typeof status !== 'string' || !['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'].includes(status.toUpperCase())) {
    errors.push('Valid status is required (PENDING, SUCCESS, FAILED, CANCELLED)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Sanitize input
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = phone.trim();
  req.body.amount = Number(amount);
  req.body.orderId = orderId.trim();
  req.body.transactionId = transactionId.trim();
  req.body.sessionId = sessionId.trim();
  req.body.status = status.toUpperCase();

  next();
};

const validatePaymentSession = (req, res, next) => {
  const { order, billing } = req.body;
  const errors = [];

  // Validate order
  if (!order) {
    errors.push('Order information is required');
  } else {
    if (!order.amount || typeof order.amount !== 'number' || order.amount <= 0) {
      errors.push('Order amount is required and must be a positive number');
    }

    if (!order.currency || typeof order.currency !== 'string') {
      errors.push('Order currency is required');
    }
  }

  // Validate billing (optional but if provided, must be valid)
  if (billing && billing.address) {
    if (billing.address.city && typeof billing.address.city !== 'string') {
      errors.push('Billing city must be a string');
    }
    if (billing.address.country && typeof billing.address.country !== 'string') {
      errors.push('Billing country must be a string');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Sanitize input
  if (req.body.order) {
    req.body.order.amount = Number(req.body.order.amount);
    if (req.body.order.currency) req.body.order.currency = req.body.order.currency.toUpperCase();
    if (req.body.order.description) req.body.order.description = req.body.order.description.trim();
  }

  next();
};

const validateQueryParams = (req, res, next) => {
  const { page, limit, status, startDate, endDate } = req.query;

  // Validate page
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Page must be a positive integer'
    });
  }

  // Validate limit
  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be an integer between 1 and 100'
    });
  }

  // Validate status
  if (status && !['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'].includes(status.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: 'Status must be one of: PENDING, SUCCESS, FAILED, CANCELLED'
    });
  }

  // Validate dates
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      error: 'Start date must be a valid ISO date string'
    });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      error: 'End date must be a valid ISO date string'
    });
  }

  // Sanitize query params
  if (req.query.page) req.query.page = Number(req.query.page);
  if (req.query.limit) req.query.limit = Number(req.query.limit);
  if (req.query.status) req.query.status = req.query.status.toUpperCase();

  next();
};

// Sanitize response data (remove internal fields)
const sanitizeResponse = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponse(item));
  }

  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    
    // Remove MongoDB internal fields
    delete sanitized.__v;
    delete sanitized._id;
    
    // Convert _id to id if it's a mongoose object
    if (data._id) {
      sanitized.id = data._id.toString();
    }

    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] && typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeResponse(sanitized[key]);
      }
    });

    return sanitized;
  }

  return data;
};

// Error handling middleware
const handleError = (error, req, res, next) => {
  console.error('API Error:', error);

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: error.message,
      ...(isDevelopment && { stack: error.stack })
    });
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    });
  }

  // Generic error response
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack })
  });
};

module.exports = {
  validateDonationConfirmation,
  validatePaymentSession,
  validateQueryParams,
  sanitizeResponse,
  handleError
};
