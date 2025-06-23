// Health check controller
const healthCheck = (req, res) => {
  res.json({ 
    message: 'API is running', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
};

module.exports = {
  healthCheck
}; 