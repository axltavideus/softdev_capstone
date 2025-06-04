const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const secretKey = 'b58ec2ec12ef28dc04c5a365973938bf7bcf6d6fb8a0802199b454802c9b4e41d465dca99d8e3632a30d51b5ecff621dc0bd28c6cd3f33a6949fae81928294733724c21e1697f3aebfbc163a84c090f56595f504e46dff022ec4c829cf25ac42e9445d63f612e3e7dec388c09b44ec71314d0a9357ad98fe7905880af773a10740c4ddb26fb8abf95d4403973700583a4792df0f74c9d924327fc35b3d08aee5b7872e1ccda20eb99e33263cb29e63b64567d576078d5c2c7c75cccfb0b89fa812af6b37cdfa3bfd30f415f7bb6e652afc21071d48d06fb65930383d944b662e61a8d8f1f710a7701ac32c45e4fd31e3df28194df75191aa118d21f9196db3ec'; // Replace with environment variable in production

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
    return res.status(200).json({ token, userId: user.id, username: user.username });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'isAdmin'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
