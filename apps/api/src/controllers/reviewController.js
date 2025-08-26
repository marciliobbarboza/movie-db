const Review = require('../models/Review');
const Movie = require('../models/Movie');

async function recalcMovieStats(movieId) {
    const agg = await Review.aggregate([
        { $match: { movie: new (require('mongoose')).Types.ObjectId(movieId) } },
        { $group: { _id: '$movie', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const avg = agg.length ? Number(agg[0].avg.toFixed(2)) : 0;
    const count = agg.length ? agg[0].count : 0;
    await Movie.findByIdAndUpdate(movieId, { avgRating: avg, ratingsCount: count });
}

async function listByMovie(req, res) {
    try {
        const { movieId } = req.params;
        const reviews = await Review.find({ movie: movieId })
            .sort({ createdAt: -1 })
            .populate({ path: 'user', select: 'name email' });
        res.json(reviews);
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function create(req, res) {
    try {
        const { movieId } = req.params;
        const { rating, comment } = req.body;

        const r = Number(rating);
        if (!r || r < 1 || r > 5) return res.status(400).json({ message: 'invalid_rating' });

        const exists = await Review.findOne({ movie: movieId, user: req.userId });
        if (exists) return res.status(409).json({ message: 'already_reviewed' });

        const created = await Review.create({ movie: movieId, user: req.userId, rating: r, comment: comment || '' });
        await recalcMovieStats(movieId);

        const populated = await created.populate({ path: 'user', select: 'name email' });
        res.status(201).json(populated);
    } catch (e) {
        res.status(500).json({ message: 'error' });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'not_found' });
        if (String(review.user) !== String(req.userId)) return res.status(403).json({ message: 'forbidden' });

        const { rating, comment } = req.body;
        if (rating !== undefined) {
            const r = Number(rating);
            if (!r || r < 1 || r > 5) return res.status(400).json({ message: 'invalid_rating' });
            review.rating = r;
        }
        if (comment !== undefined) review.comment = comment;

        await review.save();
        await recalcMovieStats(review.movie);

        const populated = await review.populate({ path: 'user', select: 'name email' });
        res.json(populated);
    } catch (_e) {
        res.status(400).json({ message: 'invalid_data' });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'not_found' });
        if (String(review.user) !== String(req.userId)) return res.status(403).json({ message: 'forbidden' });

        const movieId = review.movie;
        await review.deleteOne();
        await recalcMovieStats(movieId);

        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'invalid_id' });
    }
}

module.exports = { listByMovie, create, update, remove };
