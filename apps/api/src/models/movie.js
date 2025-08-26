const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        year: { type: Number },
        genres: [{ type: String, trim: true }],
        description: { type: String, trim: true },
        director: { type: String, trim: true },
        cast: [{ type: String, trim: true }],
        rating: { type: Number, min: 0, max: 10 },
        duration: { type: Number },
        country: { type: String, trim: true },
        language: { type: String, trim: true },
        posterUrl: { type: String, trim: true },
        avgRating: { type: Number, default: 0 },
        ratingsCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

movieSchema.index({ title: 1, year: 1 }, { unique: true, sparse: true });
movieSchema.index({ title: 'text', description: 'text', director: 'text', cast: 'text' }, { default_language: 'none', language_override: '___ignored' });
movieSchema.index({ year: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ avgRating: 1 });

module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);