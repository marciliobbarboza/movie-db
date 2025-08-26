const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');

async function listUsers(req, res) {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const p = Math.max(1, Number(page));
        const l = Math.min(100, Math.max(1, Number(limit)));
        const skip = (p - 1) * l;
        const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
        const [items, total] = await Promise.all([
            User.find(filter).select('name createdAt').sort({ createdAt: -1 }).skip(skip).limit(l),
            User.countDocuments(filter)
        ]);
        res.json({ items, page: p, limit: l, total, pages: Math.max(1, Math.ceil(total / l)) });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function followingList(req, res) {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const me = await User.findById(req.userId).select('following');
        if (!me) return res.status(401).json({ message: 'unauthorized' });
        const ids = me.following || [];
        const p = Math.max(1, Number(page));
        const l = Math.min(100, Math.max(1, Number(limit)));
        const skip = (p - 1) * l;
        const nameFilter = q ? { name: new RegExp(q, 'i') } : {};
        const [items, total] = await Promise.all([
            User.find({ _id: { $in: ids }, ...nameFilter }).select('name createdAt').sort({ createdAt: -1 }).skip(skip).limit(l),
            User.countDocuments({ _id: { $in: ids }, ...nameFilter })
        ]);
        res.json({ items, page: p, limit: l, total, pages: Math.max(1, Math.ceil(total / l)) });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function getUser(req, res) {
    try {
        const u = await User.findById(req.params.id).select('name createdAt followers following');
        if (!u) return res.status(404).json({ message: 'not_found' });
        res.json({
            _id: u._id,
            name: u.name,
            createdAt: u.createdAt,
            followersCount: u.followers.length,
            followingCount: u.following.length
        });
    } catch (_e) {
        res.status(400).json({ message: 'invalid_id' });
    }
}

async function followStatus(req, res) {
    try {
        const targetId = req.params.id;
        if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ message: 'invalid_id' });
        const exists = await User.exists({ _id: req.userId, following: targetId });
        res.json({ isFollowing: !!exists });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function getUserWatchlist(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.params.id;
        if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'invalid_id' });
        const u = await User.findById(userId).select('watchlist');
        if (!u) return res.status(404).json({ message: 'not_found' });
        const ids = u.watchlist || [];
        const p = Math.max(1, Number(page));
        const l = Math.min(100, Math.max(1, Number(limit)));
        const skip = (p - 1) * l;
        const items = await Movie.find({ _id: { $in: ids } }).sort({ createdAt: -1 }).skip(skip).limit(l);
        const total = await Movie.countDocuments({ _id: { $in: ids } });
        res.json({ items, page: p, limit: l, total, pages: Math.max(1, Math.ceil(total / l)) });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function follow(req, res) {
    try {
        const targetId = req.params.id;
        if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ message: 'invalid_id' });
        if (String(targetId) === String(req.userId)) return res.status(400).json({ message: 'invalid_target' });
        const target = await User.findById(targetId).select('_id');
        if (!target) return res.status(404).json({ message: 'not_found' });
        await Promise.all([
            User.updateOne({ _id: req.userId }, { $addToSet: { following: targetId } }),
            User.updateOne({ _id: targetId }, { $addToSet: { followers: req.userId } })
        ]);
        res.status(204).end();
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function unfollow(req, res) {
    try {
        const targetId = req.params.id;
        if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ message: 'invalid_id' });
        await Promise.all([
            User.updateOne({ _id: req.userId }, { $pull: { following: targetId } }),
            User.updateOne({ _id: targetId }, { $pull: { followers: req.userId } })
        ]);
        res.status(204).end();
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

module.exports = { listUsers, followingList, getUser, followStatus, getUserWatchlist, follow, unfollow };
