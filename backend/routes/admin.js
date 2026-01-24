const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

// POST /admin/generate
router.post('/generate', adminController.postGenerateBatch);

module.exports = router;