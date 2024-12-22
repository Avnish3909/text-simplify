// src/middleware/requestLogger.js
const requestLogger = (req, res, next) => {
    const startTime = new Date();
    
    console.log(`[${startTime.toISOString()}] ${req.method} ${req.url}`);
    
    res.on('finish', () => {
      const duration = Date.now() - startTime.getTime();
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    
    next();
  };
  
  module.exports = { requestLogger };