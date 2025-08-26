import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, post, del } from '../services/api.js';
import MovieCard from '../components/MovieCard.jsx';

export default function UserProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(12);
    const [loading, setLoading] = useState(false);
    const me = JSON.parse(localStorage.getItem('user') || 'null');
    const isMe = me && me._id === id;

    const qs = useMemo(() => new URLSearchParams({ page, limit }).toString(), [page, limit]);

    async function loadProfile() {
        const data = await get(`/users/${id}/public`);
        setProfile(data);
    }
    async function loadStatus() {
        try {
            const data = await get(`/users/${id}/status`);
            setIsFollowing(!!data.isFollowing);
        } catch { }
    }
    async function loadWatchlist() {
        setLoading(true);
        try {
            const data = await get(`/users/${id}/watchlist?${qs}`);
            setItems(data.items || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
        } finally {
            setLoading(false);
        }
    }

    async function toggleFollow() {
        try {
            setFollowBusy(true);
            if (isFollowing) {
                await del(`/users/${id}/follow`);
                setIsFollowing(false);
            } else {
                await post(`/users/${id}/follow`, {});
                setIsFollowing(true);
            }
            await loadProfile();
        } finally {
            setFollowBusy(false);
        }
    }

    useEffect(() => { loadProfile(); loadStatus(); }, [id]);
    useEffect(() => { loadWatchlist(); }, [id, qs]);

    return (
        <div className="container">
            <header className="header" style={{ gap: 12 }}>
                <h1 style={{ marginRight: 'auto' }}>{profile ? profile.name : 'User'}</h1>
                <Link className="btn-secondary" to="/users">Following</Link>
                <Link className="btn-secondary" to="/">Home</Link>
            </header>

            {profile && !isMe && (
                <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: '#94a3b8', fontSize: 14 }}>
                        Followers {profile.followersCount} • Following {profile.followingCount}
                    </div>
                    <button className={isFollowing ? 'btn-secondary' : 'btn'} disabled={followBusy} onClick={toggleFollow}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                </div>
            )}

            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Watchlist</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                    {loading
                        ? Array.from({ length: limit }).map((_, i) => (<div key={i} className="card" style={{ height: 220, opacity: .5 }} />))
                        : items.map(m => (<MovieCard key={m._id} movie={m} initialSaved={false} />))
                    }
                </div>
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
