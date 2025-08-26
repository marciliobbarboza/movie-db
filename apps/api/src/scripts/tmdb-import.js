const axios = require('axios');
const mongoose = require('mongoose');
const { connectMongo } = require('../database/mongoose');
const Movie = require('../models/Movie');

const API_KEY = process.env.TMDB_API_KEY;
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';

function getArg(name, def) {
    const i = process.argv.indexOf(`--${name}`);
    if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
    return def;
}
const pos = process.argv.slice(2).filter(v => !v.startsWith('--'));
const PAGES_POS = pos[0], TYPE_POS = pos[1], LANG_POS = pos[2], REGION_POS = pos[3];

const TYPE = getArg('type', TYPE_POS || 'popular');
const PAGES = Number(getArg('pages', PAGES_POS || '3'));
const LANG = getArg('lang', LANG_POS || 'en-CA');
const REGION = getArg('region', REGION_POS || 'CA');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchGenres(lang, region) {
    const url = `${BASE}/genre/movie/list?api_key=${API_KEY}&language=${lang}&region=${region}`;
    const { data } = await axios.get(url);
    const map = {};
    (data.genres || []).forEach(g => { map[g.id] = g.name; });
    return map;
}

async function fetchList(page, type, lang, region) {
    const url = `${BASE}/movie/${type}?api_key=${API_KEY}&language=${lang}&region=${region}&page=${page}`;
    const { data } = await axios.get(url);
    return data.results || [];
}

async function fetchDetails(id, lang, region) {
    const url = `${BASE}/movie/${id}?api_key=${API_KEY}&language=${lang}&region=${region}&append_to_response=credits`;
    const { data } = await axios.get(url);
    return data;
}

function pickDirector(credits) {
    const crew = (credits && credits.crew) || [];
    const d = crew.find(c => c.job === 'Director');
    return d ? d.name : undefined;
}

function pickCast(credits, n = 6) {
    const cast = (credits && credits.cast) || [];
    return cast.slice(0, n).map(c => c.name);
}

function tmdbToDoc(t, genresMap) {
    const year = t.release_date ? Number(String(t.release_date).slice(0, 4)) : undefined;
    const genres = (t.genres ? t.genres.map(g => g.name) : (t.genre_ids || []).map(id => genresMap[id])).filter(Boolean);
    const language = t.original_language || undefined;
    const posterUrl = t.poster_path ? `${IMG}${t.poster_path}` : undefined;
    const description = t.overview || '';
    const rating10 = typeof t.vote_average === 'number' ? Number(t.vote_average.toFixed(1)) : undefined;

    return {
        title: t.title || t.original_title,
        year,
        genres,
        description,
        director: undefined,
        cast: [],
        rating: rating10,
        duration: t.runtime || undefined,
        country: (t.production_countries && t.production_countries[0] && t.production_countries[0].name) || undefined,
        language,
        posterUrl
    };
}

async function upsertMovie(doc, extra) {
    const filter = {};
    if (doc.title) filter.title = doc.title;
    if (doc.year) filter.year = doc.year;

    const data = { ...doc, ...extra };
    const opts = { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true };
    return Movie.findOneAndUpdate(filter, data, opts);
}

async function main() {
    if (!API_KEY) {
        console.log('TMDB_API_KEY not found');
        process.exit(1);
    }

    await connectMongo();

    const genresMap = await fetchGenres(LANG, REGION);
    let imported = 0;

    for (let p = 1; p <= PAGES; p++) {
        const list = await fetchList(p, TYPE, LANG, REGION);

        for (const item of list) {
            try {
                const details = await fetchDetails(item.id, LANG, REGION);

                const baseDoc = tmdbToDoc(details, genresMap);
                const director = pickDirector(details.credits);
                const cast = pickCast(details.credits, 6);

                await upsertMovie(baseDoc, { director, cast });

                imported++;
                if (imported % 20 === 0) console.log(`Imported/updated: ${imported}`);
                await sleep(200);
            } catch (e) {
                console.log('Failed on id', item.id, '-', e.response?.status || e.message);
                await sleep(300);
            }
        }
    }

    console.log(`Completed. Total imported/updated: ${imported}`);
    await mongoose.disconnect();
    process.exit(0);
}

main().catch(async (e) => {
    console.log('General error:', e.message);
    await mongoose.disconnect();
    process.exit(1);
});
