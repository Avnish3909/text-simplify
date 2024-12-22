// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');
// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Register new user
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      template: 'verification',
      data: {
        name: user.name,
        url: verificationUrl
      }
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    await user.save();
    throw new ApiError(500, 'Email could not be sent');
  }

  // Generate API key
  const apiKey = user.generateApiKey('default');
  await user.save();

  const token = generateToken(user._id);

  res.status(201).json({
    status: 'success',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        apiKey
      }
    }
  });
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new ApiError(401, 'Please verify your email first');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(401, 'Your account has been deactivated');
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'No user found with that email address');
  }

  // Generate reset token
  const resetToken = user.generateResetToken();
  await user.save();

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      template: 'resetPassword',
      data: {
        name: user.name,
        url: resetUrl
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new ApiError(500, 'Email could not be sent');
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user by token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password has been reset'
  });
};

// Verify email
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken
  });

  if (!user) {
    throw new ApiError(400, 'Invalid verification token');
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        apiKeys: user.apiKeys.map(key => ({
          name: key.name,
          createdAt: key.createdAt,
          lastUsed: key.lastUsed,
          isActive: key.isActive,
          usageCount: key.usageCount
        }))
      }
    }
  });
};

// Update password
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
};

// Update user details
exports.updateMe = async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { 
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
};