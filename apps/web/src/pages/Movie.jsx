import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, post, del } from '../services/api.js';
import ReviewForm from '../components/ReviewForm.jsx';
import ReviewList from '../components/ReviewList.jsx';

export default function Movie() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);

    async function load() {
        const data = await get(`/movies/${id}`);
        setMovie(data);
    }

    async function toggleSave() {
        try {
            setBusy(true);
            if (saved) { await del(`/users/me/watchlist/${id}`); setSaved(false); }
            else { await post(`/users/me/watchlist/${id}`, {}); setSaved(true); }
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => { load(); setSaved(false); }, [id]);

    if (!movie) return (
        <div className="container">
            <header className="header" style={{ gap: 12 }}>
                <Link className="btn-secondary" to="/">Home</Link>
            </header>
            <div className="card" style={{ height: 220, opacity: .5 }} />
        </div>
    );

    return (
        <div className="container">
            <header className="header" style={{ gap: 12 }}>
                <h1 style={{ marginRight: 'auto' }}>{movie.title} {movie.year ? `(${movie.year})` : ''}</h1>
                <Link className="btn-secondary" to="/">Home</Link>
            </header>

            <div className="card" style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
                    <div style={{ width: '100%', aspectRatio: '3/4', background: '#0b1324', borderRadius: 10, overflow: 'hidden', border: '1px solid #1f2937' }}>
                        {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8' }}>No image</div>
                        )}
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div style={{ color: '#94a3b8' }}>{(movie.genres || []).join(' • ')}</div>
                        <div>{movie.description || 'No description'}</div>
                        <div style={{ color: '#94a3b8', fontSize: 14 }}>
                            {movie.director ? `Director: ${movie.director}` : null}
                            {movie.cast && movie.cast.length ? ` • Cast: ${movie.cast.slice(0, 6).join(', ')}` : null}
                        </div>
                        <div style={{ display: 'flex', gap: 16, color: '#94a3b8', fontSize: 14 }}>
                            {movie.duration ? <span>{movie.duration} min</span> : null}
                            {movie.country ? <span>{movie.country}</span> : null}
                            {movie.language ? <span>{movie.language}</span> : null}
                            <span>⭐ {movie.avgRating ?? 0} ({movie.ratingsCount ?? 0})</span>
                        </div>
                        <div>
                            <button className={saved ? 'btn-secondary' : 'btn'} disabled={busy} onClick={toggleSave}>
                                {saved ? 'Remove' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Write a review</div>
                <ReviewForm movieId={id} onCreated={load} />
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Reviews</div>
                <ReviewList movieId={id} />
            </div>
        </div>
    );
}
