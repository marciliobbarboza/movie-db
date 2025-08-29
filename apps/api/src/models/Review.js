const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, trim: true, required: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
    },
    { timestamps: true }
);

const commentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, trim: true, required: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
        replies: [replySchema]
    },
    { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
    {
        movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        text: { type: String, trim: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
        comments: [commentSchema]
    },
    { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
