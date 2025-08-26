import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/api.js';
import MovieCard from '../components/MovieCard.jsx';

export default function Watchlist() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [loading, setLoading] = useState(false);

    const qs = useMemo(() => new URLSearchParams({ page, limit }).toString(), [page, limit]);

    async function load() {
        setLoading(true);
        try {
            const data = await get(`/users/me/watchlist?${qs}`);
            setItems(data.items || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [qs]);

    return (
        <div className="container">
            <header className="header" style={{ gap: 12 }}>
                <h1 style={{ marginRight: 'auto' }}>My Watchlist</h1>
                <Link className="btn-secondary" to="/">Home</Link>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                {loading
                    ? Array.from({ length: limit }).map((_, i) => (<div key={i} className="card" style={{ height: 220, opacity: .5 }} />))
                    : items.map(m => (<MovieCard key={m._id} movie={m} initialSaved />))
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
