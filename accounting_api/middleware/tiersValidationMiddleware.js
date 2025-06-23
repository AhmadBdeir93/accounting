// Validation middleware for tier creation
const validateTierCreation = (req, res, next) => {
  const { nom, type, email, telephone } = req.body;

  // Check required fields
  if (!nom || !type) {
    return res.status(400).json({ 
      message: 'Nom and type are required fields',
      missing: []
    });
  }

  // Validate nom length
  if (nom.length < 2 || nom.length > 255) {
    return res.status(400).json({ 
      message: 'Nom must be between 2 and 255 characters long' 
    });
  }

  // Validate type
  if (!['client', 'fournisseur'].includes(type)) {
    return res.status(400).json({ 
      message: 'Type must be either "client" or "fournisseur"' 
    });
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }
  }

  // Validate telephone format if provided
  if (telephone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
    if (!phoneRegex.test(telephone)) {
      return res.status(400).json({ 
        message: 'Please provide a valid phone number' 
      });
    }
  }

  next();
};

// Validation middleware for tier update
const validateTierUpdate = (req, res, next) => {
  const { nom, type, email, telephone } = req.body;

  // Check if at least one field is provided
  if (!nom && !type && email === undefined && telephone === undefined) {
    return res.status(400).json({ 
      message: 'At least one field must be provided for update' 
    });
  }

  // Validate nom length if provided
  if (nom && (nom.length < 2 || nom.length > 255)) {
    return res.status(400).json({ 
      message: 'Nom must be between 2 and 255 characters long' 
    });
  }

  // Validate type if provided
  if (type && !['client', 'fournisseur'].includes(type)) {
    return res.status(400).json({ 
      message: 'Type must be either "client" or "fournisseur"' 
    });
  }

  // Validate email format if provided
  if (email !== undefined) {
    if (email === null || email === '') {
      // Allow empty email
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Please provide a valid email address' 
        });
      }
    }
  }

  // Validate telephone format if provided
  if (telephone !== undefined) {
    if (telephone === null || telephone === '') {
      // Allow empty telephone
    } else {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
      if (!phoneRegex.test(telephone)) {
        return res.status(400).json({ 
          message: 'Please provide a valid phone number' 
        });
      }
    }
  }

  next();
};

module.exports = {
  validateTierCreation,
  validateTierUpdate
}; 