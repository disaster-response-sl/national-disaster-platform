const validateDonationConfirmation = (req, res, next) => {
  const {
    name,
    email,
    phone,
    amount,
    orderId,
    transactionId,
    sessionId,
    status
  } = req.body;

  const errors = [];

  // Required field validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Valid email is required');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    errors.push('Phone is required and must be a non-empty string');
  }

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push('Amount is required and must be a positive number');
  }

  if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
    errors.push('OrderId is required and must be a non-empty string');
  }

  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim().length === 0) {
    errors.push('TransactionId is required and must be a non-empty string');
  }

  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    errors.push('SessionId is required and must be a non-empty string');
  }

  if (!status || typeof status !== 'string' || !['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'].includes(status.toUpperCase())) {
    errors.push('Status is required and must be one of: PENDING, SUCCESS, FAILED, CANCELLED');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Sanitize data
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = phone.trim();
  req.body.amount = parseFloat(amount);
  req.body.orderId = orderId.trim();
  req.body.transactionId = transactionId.trim();
  req.body.sessionId = sessionId.trim();
  req.body.status = status.toUpperCase();

  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Page must be a positive integer'
    });
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be a positive integer between 1 and 100'
    });
  }

  next();
};

module.exports = {
  validateDonationConfirmation,
  validatePagination
};
