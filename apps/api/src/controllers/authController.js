const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

function makeToken(userId) {
    return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
}

async function signup(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'missing_fields' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: 'email_in_use' });

        const hash = await bcrypt.hash(password, 10);
        const created = await User.create({ name, email, password: hash });

        const token = makeToken(created._id);
        res.status(201).json({
            token,
            user: { id: created._id, name: created.name, email: created.email }
        });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'missing_fields' });

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ message: 'invalid_credentials' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: 'invalid_credentials' });

        const token = makeToken(user._id);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

module.exports = { signup, login };
