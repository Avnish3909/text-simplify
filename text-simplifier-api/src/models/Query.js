// src/models/Query.js
const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['elementary', 'standard', 'technical'],
    required: true
  },
  simplifiedText: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String
  }],
  readingLevel: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Query = mongoose.model('Query', querySchema);
module.exports = Query;