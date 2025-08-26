import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/api.js';

export default function Users() {
    const [q, setQ] = useState('');
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(20);
    const [loading, setLoading] = useState(false);

    const qs = useMemo(() => {
        const p = new URLSearchParams({ page, limit });
        if (q) p.set('q', q);
        return p.toString();
    }, [q, page, limit]);

    async function load() {
        setLoading(true);
        try {
            const data = await get(`/users/me/following?${qs}`);
            setItems(data.items || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [qs]);

    return (
        <div className="container">
            <header className="header" style={{ gap: 12 }}>
                <h1 style={{ marginRight: 'auto' }}>Following</h1>
                <Link className="btn-secondary" to="/">Home</Link>
            </header>

            <div className="card" style={{ marginBottom: 16 }}>
                <form className="form" onSubmit={e => { e.preventDefault(); setPage(1); load(); }}>
                    <div className="row">
                        <label>Search</label>
                        <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Name" />
                    </div>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
                {loading
                    ? Array.from({ length: limit }).map((_, i) => (<div key={i} className="card" style={{ height: 80, opacity: .5 }} />))
                    : items.map(u => (
                        <div key={u._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'grid' }}>
                                <div style={{ fontWeight: 700 }}>{u.name}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                            </div>
                            <Link className="btn" to={`/users/${u._id}`}>View</Link>
                        </div>
                    ))
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
