import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/api.js';
import MovieCard from '../components/MovieCard.jsx';

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

function Checkbox({ label, checked, onChange }) {
    return (
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            {label}
        </label>
    );
}

export default function Home() {
    const [showFilters, setShowFilters] = useState(false);
    const [q, setQ] = useState('');
    const [genresSel, setGenresSel] = useState([]);
    const [year, setYear] = useState('');
    const [minYear, setMinYear] = useState('');
    const [maxYear, setMaxYear] = useState('');
    const [minRating, setMinRating] = useState('');
    const [maxRating, setMaxRating] = useState('');
    const [minDuration, setMinDuration] = useState('');
    const [maxDuration, setMaxDuration] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const params = useMemo(() => {
        const p = { page, limit, sort };
        if (q) p.q = q;
        if (genresSel.length) p.genre = genresSel.join(',');
        if (year) p.year = year;
        if (minYear) p.minYear = minYear;
        if (maxYear) p.maxYear = maxYear;
        if (minRating) p.minRating = minRating;
        if (maxRating) p.maxRating = maxRating;
        if (minDuration) p.minDuration = minDuration;
        if (maxDuration) p.maxDuration = maxDuration;
        return p;
    }, [q, genresSel, year, minYear, maxYear, minRating, maxRating, minDuration, maxDuration, page, limit, sort]);

    async function load() {
        setLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const data = await get(`/movies?${query}`);
            setItems(data.items || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch {
            setItems([]); setTotal(0); setPages(1);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [params]);

    function toggleGenre(g) {
        setPage(1);
        setGenresSel(s => s.includes(g) ? s.filter(x => x !== g) : [...s, g]);
    }

    function applyFilters(e) { e.preventDefault(); setPage(1); load(); }

    function clearFilters() {
        setQ(''); setGenresSel([]); setYear(''); setMinYear(''); setMaxYear('');
        setMinRating(''); setMaxRating(''); setMinDuration(''); setMaxDuration('');
        setSort('-createdAt'); setPage(1);
    }

    return (
        <div className="container">
            <header className="header" style={{ gap: 12 }}>
                <h1 style={{ marginRight: 'auto' }}>Movies DB</h1>
                <Link className="btn-secondary" to="/users">Following</Link>
                <Link className="btn-secondary" to="/watchlist">My Watchlist</Link>
                <Link className="btn-secondary" to="/me">My Profile</Link>
                <button className="btn-secondary" onClick={() => setShowFilters(v => !v)}>
                    {showFilters ? 'Hide filters' : 'Filter'}
                </button>
            </header>

            {showFilters && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <form className="form" onSubmit={applyFilters} style={{ gridTemplateColumns: '1fr', gap: 12 }}>
                        <div className="row">
                            <label>Search</label>
                            <input className="input" placeholder="Title, description, director, cast…" value={q} onChange={e => setQ(e.target.value)} />
                        </div>

                        <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                            <div className="row">
                                <label>Year</label>
                                <input className="input" type="number" value={year} onChange={e => { setYear(e.target.value); setPage(1); }} placeholder="1999" />
                            </div>
                            <div className="row">
                                <label>Min year</label>
                                <input className="input" type="number" value={minYear} onChange={e => { setMinYear(e.target.value); setPage(1); }} placeholder="1990" />
                            </div>
                            <div className="row">
                                <label>Max year</label>
                                <input className="input" type="number" value={maxYear} onChange={e => { setMaxYear(e.target.value); setPage(1); }} placeholder="2024" />
                            </div>
                            <div className="row">
                                <label>Min rating (1–5)</label>
                                <input className="input" type="number" min="1" max="5" value={minRating} onChange={e => { setMinRating(e.target.value); setPage(1); }} placeholder="4" />
                            </div>
                            <div className="row">
                                <label>Max rating (1–5)</label>
                                <input className="input" type="number" min="1" max="5" value={maxRating} onChange={e => { setMaxRating(e.target.value); setPage(1); }} placeholder="5" />
                            </div>
                            <div className="row">
                                <label>Min duration (min)</label>
                                <input className="input" type="number" value={minDuration} onChange={e => { setMinDuration(e.target.value); setPage(1); }} placeholder="80" />
                            </div>
                            <div className="row">
                                <label>Max duration (min)</label>
                                <input className="input" type="number" value={maxDuration} onChange={e => { setMaxDuration(e.target.value); setPage(1); }} placeholder="180" />
                            </div>
                            <div className="row">
                                <label>Sort by</label>
                                <select className="input" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                                    <option value="-createdAt">Recent</option>
                                    <option value="-avgRating,year">Top rated</option>
                                    <option value="year">Year ↑</option>
                                    <option value="-year">Year ↓</option>
                                    <option value="title">Title A→Z</option>
                                    <option value="-title">Title Z→A</option>
                                </select>
                            </div>
                            <div className="row">
                                <label>Per page</label>
                                <select className="input" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                                    <option>12</option><option>24</option><option>48</option>
                                </select>
                            </div>
                        </div>

                        <div className="row" style={{ gap: 8 }}>
                            <label>Genres</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8 }}>
                                {GENRES.map(g => (
                                    <Checkbox key={g} label={g} checked={genresSel.includes(g)} onChange={() => toggleGenre(g)} />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button type="button" className="btn-secondary" onClick={clearFilters}>Clear</button>
                            <button className="btn" type="submit">Apply</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                {loading
                    ? Array.from({ length: limit }).map((_, i) => (<div key={i} className="card" style={{ height: 220, opacity: .5 }} />))
                    : items.map(m => (<MovieCard key={m._id} movie={m} />))
                }
            </div>

            <div className="mt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{total} results</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ alignSelf: 'center' }}>Page {page} of {pages}</span>
                    <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            </div>
        </div>
    );
}
