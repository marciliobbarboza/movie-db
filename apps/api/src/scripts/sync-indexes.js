const mongoose = require('mongoose');
const { connectMongo } = require('../database/mongoose');
const Movie = require('../models/Movie');

(async () => {
    try {
        await connectMongo();
        const res = await Movie.syncIndexes();
        console.log(res);
    } catch (e) {
        console.error(e.message);
    } finally {
        await mongoose.disconnect();
    }
})();
