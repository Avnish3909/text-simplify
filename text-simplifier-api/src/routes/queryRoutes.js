// src/routes/queryRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Query = require('../models/Query');
const { ApiError } = require('../middleware/errorHandler');

// Get user's query history with pagination
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const queries = await Query.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-user');

    const total = await Query.countDocuments({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      data: {
        queries,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    throw new ApiError(500, 'Error retrieving query history');
  }
});

// Get a specific query
router.get('/history/:id', protect, async (req, res) => {
  try {
    const query = await Query.findOne({
      _id: req.params.id,
      user: req.user.id
    }).select('-user');

    if (!query) {
      throw new ApiError(404, 'Query not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        query
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error retrieving query');
  }
});

// Delete a query
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const query = await Query.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!query) {
      throw new ApiError(404, 'Query not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Query deleted successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error deleting query');
  }
});

module.exports = router;