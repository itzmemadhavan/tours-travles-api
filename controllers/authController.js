const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Hardcoded secret for now, should be in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_travel_app_2026';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Insert user (No hashing as per user request)
    const userRole = role || 'user'; // default to user
    const [userId] = await db('users').insert({
      name,
      email,
      password, // Storing plaintext as requested
      role: userRole
    });

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password (Plaintext comparison as requested)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from response
    delete user.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};
