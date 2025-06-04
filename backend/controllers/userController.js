const bcrypt = require('bcrypt');
const User = require('../models/user');

const saltRounds = 10;

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'isAdmin', 'createdAt', 'updatedAt'],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'isAdmin', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, isAdmin } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (password) {
      user.password = await bcrypt.hash(password, saltRounds);
    }
    await user.save();
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};
