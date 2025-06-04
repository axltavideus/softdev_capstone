const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'b58ec2ec12ef28dc04c5a365973938bf7bcf6d6fb8a0802199b454802c9b4e41d465dca99d8e3632a30d51b5ecff621dc0bd28c6cd3f33a6949fae81928294733724c21e1697f3aebfbc163a84c090f56595f504e46dff022ec4c829cf25ac42e9445d63f612e3e7dec388c09b44ec71314d0a9357ad98fe7905880af773a10740c4ddb26fb8abf95d4403973700583a4792df0f74c9d924327fc35b3d08aee5b7872e1ccda20eb99e33263cb29e63b64567d576078d5c2c7c75cccfb0b89fa812af6b37cdfa3bfd30f415f7bb6e652afc21071d48d06fb65930383d944b662e61a8d8f1f710a7701ac32c45e4fd31e3df28194df75191aa118d21f9196db3ec');
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeAdmin,
};
