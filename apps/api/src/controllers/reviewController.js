const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const User = require('../models/User');

async function create(req, res) {
    try {
        const { movieId } = req.params;
        if (!mongoose.isValidObjectId(movieId)) return res.status(400).json({ message: 'invalid_id' });
        const { rating, text } = req.body || {};
        if (!rating) return res.status(400).json({ message: 'missing_fields' });
        const movie = await Movie.findById(movieId).select('_id');
        if (!movie) return res.status(404).json({ message: 'not_found' });
        const review = await Review.findOneAndUpdate(
            { movie: movieId, user: req.userId },
            { $set: { rating, text: text || '' } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        const agg = await Review.aggregate([
            { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
            { $group: { _id: '$movie', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        const m = agg[0];
        await Movie.updateOne(
            { _id: movieId },
            { $set: { avgRating: m ? Number(m.avg.toFixed(2)) : 0, ratingsCount: m ? m.count : 0 } }
        );
        res.status(201).json(review);
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function listByMovie(req, res) {
    try {
        const { movieId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
        if (!mongoose.isValidObjectId(movieId)) return res.status(400).json({ message: 'invalid_id' });
        const p = Math.max(1, Number(page));
        const l = Math.min(50, Math.max(1, Number(limit)));
        const skip = (p - 1) * l;

        const items = await Review.find({ movie: movieId })
            .sort(sort.split(',').join(' '))
            .skip(skip)
            .limit(l)
            .populate({ path: 'user', select: 'name' })
            .populate({ path: 'comments.user', select: 'name' })
            .populate({ path: 'comments.replies.user', select: 'name' })
            .lean();

        const total = await Review.countDocuments({ movie: movieId });
        res.json({ items, page: p, limit: l, total, pages: Math.max(1, Math.ceil(total / l)) });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function likeReview(req, res) {
    try {
        const { id } = req.params;
        await Review.updateOne({ _id: id }, { $addToSet: { likes: req.userId } });
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function unlikeReview(req, res) {
    try {
        const { id } = req.params;
        await Review.updateOne({ _id: id }, { $pull: { likes: req.userId } });
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function addComment(req, res) {
    try {
        const { id } = req.params;
        const { text } = req.body || {};
        if (!text) return res.status(400).json({ message: 'missing_fields' });
        const update = { $push: { comments: { user: req.userId, text } } };
        const r = await Review.findByIdAndUpdate(id, update, { new: true }).populate('comments.user', 'name');
        if (!r) return res.status(404).json({ message: 'not_found' });
        res.status(201).json(r.comments[r.comments.length - 1]);
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function likeComment(req, res) {
    try {
        const { id, commentId } = req.params;
        const r = await Review.updateOne(
            { _id: id, 'comments._id': commentId },
            { $addToSet: { 'comments.$.likes': req.userId } }
        );
        if (!r.matchedCount) return res.status(404).json({ message: 'not_found' });
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function unlikeComment(req, res) {
    try {
        const { id, commentId } = req.params;
        const r = await Review.updateOne(
            { _id: id, 'comments._id': commentId },
            { $pull: { 'comments.$.likes': req.userId } }
        );
        if (!r.matchedCount) return res.status(404).json({ message: 'not_found' });
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function replyComment(req, res) {
    try {
        const { id, commentId } = req.params;
        const { text } = req.body || {};
        if (!text) return res.status(400).json({ message: 'missing_fields' });
        const review = await Review.findById(id).select('comments');
        if (!review) return res.status(404).json({ message: 'not_found' });
        const c = review.comments.id(commentId);
        if (!c) return res.status(404).json({ message: 'not_found' });
        c.replies.push({ user: req.userId, text });
        await review.save();
        res.status(201).json(c.replies[c.replies.length - 1]);
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function likeReply(req, res) {
    try {
        const { id, commentId, replyId } = req.params;
        const review = await Review.findById(id).select('comments');
        if (!review) return res.status(404).json({ message: 'not_found' });
        const c = review.comments.id(commentId);
        if (!c) return res.status(404).json({ message: 'not_found' });
        const r = c.replies.id(replyId);
        if (!r) return res.status(404).json({ message: 'not_found' });
        if (!r.likes.map(String).includes(String(req.userId))) r.likes.push(req.userId);
        await review.save();
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function unlikeReply(req, res) {
    try {
        const { id, commentId, replyId } = req.params;
        const review = await Review.findById(id).select('comments');
        if (!review) return res.status(404).json({ message: 'not_found' });
        const c = review.comments.id(commentId);
        if (!c) return res.status(404).json({ message: 'not_found' });
        const r = c.replies.id(replyId);
        if (!r) return res.status(404).json({ message: 'not_found' });
        r.likes = r.likes.filter(u => String(u) !== String(req.userId));
        await review.save();
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

async function followAuthor(req, res) {
    try {
        const { id } = req.params;
        const review = await Review.findById(id).select('user');
        if (!review) return res.status(404).json({ message: 'not_found' });
        if (String(review.user) === String(req.userId)) return res.status(400).json({ message: 'invalid_target' });
        await Promise.all([
            User.updateOne({ _id: req.userId }, { $addToSet: { following: review.user } }),
            User.updateOne({ _id: review.user }, { $addToSet: { followers: req.userId } })
        ]);
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'error' });
    }
}

module.exports = {
    create,
    listByMovie,
    likeReview,
    unlikeReview,
    addComment,
    likeComment,
    unlikeComment,
    replyComment,
    likeReply,
    unlikeReply,
    followAuthor
};
