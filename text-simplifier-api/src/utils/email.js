// src/utils/email.js
const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, template, data }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // For now, sending simple text emails. Can be enhanced with HTML templates
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: subject,
      text: `Hello ${data.name},\n\n${template === 'verification' 
        ? 'Please verify your email by clicking the link below:\n\n' 
        : 'Reset your password by clicking the link below:\n\n'}${data.url}\n\nThis link will expire in ${template === 'verification' ? '24 hours' : '30 minutes'}.\n\nRegards,\nText Simplifier Team`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

module.exports = { sendEmail };