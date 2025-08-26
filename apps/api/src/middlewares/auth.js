const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        req.userId = decoded.sub;
        next();
    } catch (_e) {
        return res.status(401).json({ message: 'invalid_token' });
    }
}

module.exports = auth;
