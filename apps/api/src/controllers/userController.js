const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function list(req, res) {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const p = Math.max(1, Number(page));
        const l = Math.min(100, Math.max(1, Number(limit)));
        const skip = (p - 1) * l;
        const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
        const [items, total] = await Promise.all([
            User.find(filter).select('name email createdAt').sort({ createdAt: -1 }).skip(skip).limit(l),
            User.countDocuments(filter)
        ]);
        res.json({ items, page: p, limit: l, total, pages: Math.max(1, Math.ceil(total / l)) });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function getOne(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'invalid_id' });
        const u = await User.findById(req.params.id).select('name email createdAt');
        if (!u) return res.status(404).json({ message: 'not_found' });
        res.json(u);
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function create(req, res) {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password) return res.status(400).json({ message: 'missing_fields' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email });
    } catch (e) {
        if (e && e.code === 11000) return res.status(409).json({ message: 'email_in_use' });
        res.status(500).json({ message: 'error' });
    }
}

async function update(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'invalid_id' });
        const data = { ...req.body };
        if (data.password) data.password = await bcrypt.hash(String(data.password), 10);
        const u = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true, select: 'name email createdAt' });
        if (!u) return res.status(404).json({ message: 'not_found' });
        res.json(u);
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function remove(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'invalid_id' });
        const del = await User.findByIdAndDelete(req.params.id);
        if (!del) return res.status(404).json({ message: 'not_found' });
        res.status(204).end();
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function getMe(req, res) {
    try {
        const u = await User.findById(req.userId).select('name email createdAt');
        if (!u) return res.status(401).json({ message: 'unauthorized' });
        res.json(u);
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function updateMe(req, res) {
    try {
        const { name, password, avatar } = req.body || {};
        const u = await User.findById(req.userId).select('+password');
        if (!u) return res.status(401).json({ message: 'unauthorized' });
        if (name) u.name = name;
        if (password) u.password = await bcrypt.hash(String(password), 10);
        if (avatar && avatar.data && avatar.contentType) {
            const buf = Buffer.from(String(avatar.data), 'base64');
            u.avatar = { data: buf, contentType: String(avatar.contentType), updatedAt: new Date() };
        }
        await u.save();
        res.json({ _id: u._id, name: u.name, email: u.email });
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function getAvatar(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).end();
        const u = await User.findById(req.params.id).select('avatar');
        if (!u || !u.avatar || !u.avatar.data) return res.status(404).end();
        res.set('Content-Type', u.avatar.contentType || 'application/octet-stream');
        res.set('Cache-Control', 'no-store');
        res.send(u.avatar.data);
    } catch (_e) {
        res.status(404).end();
    }
}

module.exports = { list, getOne, create, update, remove, getMe, updateMe, getAvatar };
