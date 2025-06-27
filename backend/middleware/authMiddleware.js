const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

exports.roleMiddleware = role => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// exports.roleMiddleware = (requiredRole) => {
//   return (req, res, next) => {
//     if (req.user.role !== requiredRole) {
//       return res.status(403).json({ message: 'Forbidden: Insufficient role' });
//     }
//     next();
//   };
// };
