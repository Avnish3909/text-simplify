// src/controllers/simplifyController.js
const Anthropic = require('@anthropic-ai/sdk');
const { createPrompt, parseResponse } = require('./utils');
const Query = require('../models/Query');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const simplifyText = async (req, res) => {
  try {
    const { text, level = 'standard' } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate input
    if (!text?.trim()) {
      return res.status(400).json({
        status: 400,
        error: 'Text is required',
        message: 'Please provide text to simplify'
      });
    }

    if (!['elementary', 'standard', 'technical'].includes(level)) {
      return res.status(400).json({
        status: 400,
        error: 'Invalid simplification level',
        message: 'Level must be one of: elementary, standard, technical'
      });
    }

    const prompt = createPrompt(text, level);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const result = parseResponse(response.content[0].text);

    if (result.error) {
      return res.status(422).json({
        status: 422,
        error: 'Processing Error',
        message: result.error
      });
    }

    // Save the query and result
    await Query.create({
      user: userId,
      originalText: text,
      level,
      simplifiedText: result.simplified,
      keyPoints: result.keyPoints,
      readingLevel: result.level
    });

    // Success response
    return res.status(200).json({
      status: 200,
      message: 'Text simplified successfully',
      data: {
        simplified: result.simplified,
        keyPoints: result.keyPoints,
        level: result.level
      }
    });

  } catch (error) {
    console.error('Error in simplifyText:', error);

    // Handle specific API errors
    if (error.status === 401) {
      return res.status(401).json({
        status: 401,
        error: 'Authentication Error',
        message: 'Invalid API key'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        status: 429,
        error: 'Rate Limit Exceeded',
        message: 'Too many requests, please try again later'
      });
    }

    // Generic error response
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

module.exports = {
  simplifyText
};