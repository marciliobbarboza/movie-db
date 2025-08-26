
const Movie = require('../models/Movie');

async function list(req, res) {
    try {
        let {
            q,
            year,
            minYear,
            maxYear,
            genre,
            country,
            language,
            minRating,
            maxRating,
            minDuration,
            maxDuration,
            sort,
            page = 1,
            limit = 20
        } = req.query;

        const filter = {};

        if (q) {
            filter.$or = [
                { title: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
                { director: new RegExp(q, 'i') },
                { cast: new RegExp(q, 'i') }
            ];
        }

        if (genre) {
            const genres = Array.isArray(genre)
                ? genre
                : String(genre).split(',').map(s => s.trim()).filter(Boolean);
            if (genres.length) filter.genres = { $all: genres };
        }

        if (year) filter.year = Number(year);
        if (minYear || maxYear) {
            filter.year = filter.year || {};
            if (minYear) filter.year.$gte = Number(minYear);
            if (maxYear) filter.year.$lte = Number(maxYear);
        }

        if (country) filter.country = new RegExp(`^${country}$`, 'i');
        if (language) filter.language = new RegExp(`^${language}$`, 'i');

        if (minRating || maxRating) {
            filter.avgRating = {};
            if (minRating) filter.avgRating.$gte = Number(minRating);
            if (maxRating) filter.avgRating.$lte = Number(maxRating);
        }

        if (minDuration || maxDuration) {
            filter.duration = {};
            if (minDuration) filter.duration.$gte = Number(minDuration);
            if (maxDuration) filter.duration.$lte = Number(maxDuration);
        }

        page = Math.max(1, Number(page));
        limit = Math.min(100, Math.max(1, Number(limit)));
        const skip = (page - 1) * limit;

        let sortObj = { createdAt: -1 };
        if (sort) {
            sortObj = {};
            String(sort).split(',').forEach(s => {
                s = s.trim();
                if (!s) return;
                if (s.startsWith('-')) sortObj[s.slice(1)] = -1;
                else sortObj[s] = 1;
            });
        }

        const [items, total] = await Promise.all([
            Movie.find(filter).sort(sortObj).skip(skip).limit(limit),
            Movie.countDocuments(filter)
        ]);

        res.json({
            items,
            page,
            limit,
            total,
            pages: Math.max(1, Math.ceil(total / limit))
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
