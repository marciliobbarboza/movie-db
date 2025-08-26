import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { post, del } from '../services/api.js';

export default function MovieCard({ movie, initialSaved = false }) {
    const { _id, title, year, genres = [], posterUrl, avgRating, ratingsCount, duration, country, language } = movie;
    const [saved, setSaved] = useState(initialSaved);
    const [busy, setBusy] = useState(false);

    async function onSave() {
        try { setBusy(true); await post(`/users/me/watchlist/${_id}`, {}); setSaved(true); }
        finally { setBusy(false); }
    }
    async function onRemove() {
        try { setBusy(true); await del(`/users/me/watchlist/${_id}`); setSaved(false); }
        finally { setBusy(false); }
    }

    return (
        <div className="card" style={{ display: 'grid', gap: 10 }}>
            <Link to={`/movies/${_id}`} style={{ width: '100%', aspectRatio: '3/4', background: '#0b1324', borderRadius: 10, overflow: 'hidden', border: '1px solid #1f2937', display: 'block' }}>
                {posterUrl ? (
                    <img src={posterUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8' }}>No image</div>
                )}
            </Link>
            <div style={{ display: 'grid', gap: 6 }}>
                <Link to={`/movies/${_id}`} style={{ fontWeight: 700, color: 'inherit', textDecoration: 'none' }}>{title} {year ? `(${year})` : ''}</Link>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>{genres.slice(0, 3).join(' • ')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
                    <span>⭐ {avgRating ?? 0} ({ratingsCount ?? 0})</span>
                    <span>{duration ? `${duration} min` : ''}</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{[country, language].filter(Boolean).join(' • ')}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className={saved ? 'btn-secondary' : 'btn'} disabled={busy} onClick={saved ? onRemove : onSave}>
                        {saved ? 'Remove' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
