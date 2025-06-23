const config = require('../config/config');

// Validation middleware for registration
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  // Check if all required fields are present
  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields are required',
      missing: []
    });
  }

  // Validate username
  if (username.length < config.validation.username.minLength || 
      username.length > config.validation.username.maxLength) {
    return res.status(400).json({ 
      message: `Username must be between ${config.validation.username.minLength} and ${config.validation.username.maxLength} characters long` 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  // Validate email length
  if (email.length > config.validation.email.maxLength) {
    return res.status(400).json({ 
      message: `Email must be less than ${config.validation.email.maxLength} characters long` 
    });
  }

  // Validate password strength
  if (password.length < config.validation.password.minLength || 
      password.length > config.validation.password.maxLength) {
    return res.status(400).json({ 
      message: `Password must be between ${config.validation.password.minLength} and ${config.validation.password.maxLength} characters long` 
    });
  }

  next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  // Check if required fields are present
  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Username and password are required' 
    });
  }

  // Validate username length
  if (username.length < config.validation.username.minLength || 
      username.length > config.validation.username.maxLength) {
    return res.status(400).json({ 
      message: `Username must be between ${config.validation.username.minLength} and ${config.validation.username.maxLength} characters long` 
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin
}; 