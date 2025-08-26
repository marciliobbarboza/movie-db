const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');

async function list(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const u = await User.findById(req.userId).select('watchlist');
        if (!u) return res.status(401).json({ message: 'unauthorized' });
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

async function add(req, res) {
    try {
        const movieId = String(req.params.movieId || '').trim();
        let exists = null;
        try { exists = await Movie.findById(movieId).select('_id'); } catch { return res.status(400).json({ message: 'invalid_id' }); }
        if (!exists) return res.status(404).json({ message: 'not_found' });
        await User.updateOne({ _id: req.userId }, { $addToSet: { watchlist: exists._id } });
        res.status(204).end();
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function remove(req, res) {
    try {
        const movieId = String(req.params.movieId || '').trim();
        let valid = true;
        try { new mongoose.Types.ObjectId(movieId); } catch { valid = false; }
        if (!valid) return res.status(400).json({ message: 'invalid_id' });
        await User.updateOne({ _id: req.userId }, { $pull: { watchlist: movieId } });
        res.status(204).end();
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

module.exports = { list, add, remove };
