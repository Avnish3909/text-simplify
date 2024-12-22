const express = require('express');
const router = express.Router();
const { simplifyText } = require('../controllers/simplifyController');
const { rateLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');

router.post('/simplify', protect, rateLimiter, simplifyText);

module.exports = router;