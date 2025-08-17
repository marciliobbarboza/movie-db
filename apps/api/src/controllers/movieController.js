const Movie = require('../models/Movie');

async function list(req, res) {
    try {
        const { search, page = 1, limit = 20, year, genre } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { director: new RegExp(search, 'i') },
                { cast: new RegExp(search, 'i') }
            ];
        }
        if (year) filter.year = Number(year);
        if (genre) filter.genres = { $in: [genre] };

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Movie.countDocuments(filter)
        ]);

        res.json({
            items,
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)) || 1
        });
    } catch (_e) {
        res.status(500).json({ message: 'error' });
    }
}

async function getOne(req, res) {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'not_found' });
        res.json(movie);
    } catch (_e) {
        res.status(400).json({ message: 'invalid_id' });
    }
}

async function create(req, res) {
    try {
        const data = req.body;
        if (!data || !data.title) return res.status(400).json({ message: 'missing_title' });

        const created = await Movie.create(data);
        res.status(201).json(created);
    } catch (e) {
        if (e && e.code === 11000) return res.status(409).json({ message: 'duplicate_movie' });
        res.status(500).json({ message: 'error' });
    }
}

async function update(req, res) {
    try {
        const data = req.body || {};
        const updated = await Movie.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true
        });
        if (!updated) return res.status(404).json({ message: 'not_found' });
        res.json(updated);
    } catch (_e) {
        res.status(400).json({ message: 'invalid_data' });
    }
}

async function remove(req, res) {
    try {
        const deleted = await Movie.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'not_found' });
        res.status(204).end();
    } catch (_e) {
        res.status(400).json({ message: 'invalid_id' });
    }
}

module.exports = { list, getOne, create, update, remove };
