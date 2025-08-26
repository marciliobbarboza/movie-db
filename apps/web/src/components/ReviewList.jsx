import React, { useEffect, useMemo, useState } from 'react';
import { get, post, del } from '../services/api.js';
import { Link } from 'react-router-dom';

function ReviewItem({ r, onRefresh }) {
    const [likeBusy, setLikeBusy] = useState(false);
    const [commentBusy, setCommentBusy] = useState(false);
    const [replyBusy, setReplyBusy] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const me = JSON.parse(localStorage.getItem('user') || 'null');
    const isAuthorMe = me && r.user && me._id === r.user._id;

    async function toggleLike() {
        try {
            setLikeBusy(true);
            await post(`/reviews/${r._id}/like`, {});
            if (onRefresh) onRefresh();
        } catch {
            try { await del(`/reviews/${r._id}/like`); if (onRefresh) onRefresh(); } catch { }
        } finally {
            setLikeBusy(false);
        }
    }

    async function addComment() {
        if (!commentText.trim()) return;
        try {
            setCommentBusy(true);
            await post(`/reviews/${r._id}/comments`, { text: commentText.trim() });
            setCommentText('');
            if (onRefresh) onRefresh();
        } finally {
            setCommentBusy(false);
        }
    }

    async function addReply(commentId) {
        if (!replyText.trim()) return;
        try {
            setReplyBusy(true);
            await post(`/reviews/${r._id}/comments/${commentId}/replies`, { text: replyText.trim() });
            setReplyText('');
            if (onRefresh) onRefresh();
        } finally {
            setReplyBusy(false);
        }
    }

    async function toggleFollowAuthor() {
        if (isAuthorMe) return;
        try {
            setFollowBusy(true);
            await post(`/reviews/${r._id}/follow-author`, {});
        } finally {
            setFollowBusy(false);
        }
    }

    return (
        <div className="card" style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'grid' }}>
                    <div style={{ fontWeight: 700 }}>
                        {r.user?._id ? <Link to={`/users/${r.user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{r.user.name}</Link> : 'User'} • ⭐ {r.rating}
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                {!isAuthorMe && (
                    <button className="btn-secondary" disabled={followBusy} onClick={toggleFollowAuthor}>Follow</button>
                )}
            </div>

            <div>{r.text || ''}</div>

            <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" disabled={likeBusy} onClick={toggleLike}>
                    Like ({r.likes?.length || 0})
                </button>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
                {(r.comments || []).map(c => (
                    <div key={c._id} className="card" style={{ background: '#0b1324' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600 }}>
                                {c.user?._id ? <Link to={`/users/${c.user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{c.user.name}</Link> : 'User'}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-secondary" onClick={async () => { await post(`/reviews/${r._id}/comments/${c._id}/like`, {}); if (onRefresh) onRefresh(); }}>
                                    Like ({c.likes?.length || 0})
                                </button>
                                <button className="btn-secondary" onClick={async () => { await del(`/reviews/${r._id}/comments/${c._id}/like`); if (onRefresh) onRefresh(); }}>
                                    Unlike
                                </button>
                            </div>
                        </div>
                        <div style={{ marginTop: 6 }}>{c.text}</div>

                        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                            {(c.replies || []).map(rep => (
                                <div key={rep._id} className="card" style={{ background: '#0a1020' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600 }}>
                                            {rep.user?._id ? <Link to={`/users/${rep.user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{rep.user.name}</Link> : 'User'}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn-secondary" onClick={async () => { await post(`/reviews/${r._id}/comments/${c._id}/replies/${rep._id}/like`, {}); if (onRefresh) onRefresh(); }}>
                                                Like ({rep.likes?.length || 0})
                                            </button>
                                            <button className="btn-secondary" onClick={async () => { await del(`/reviews/${r._id}/comments/${c._id}/replies/${rep._id}/like`); if (onRefresh) onRefresh(); }}>
                                                Unlike
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 6 }}>{rep.text}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <input className="input" placeholder="Write a reply" value={replyText} onChange={e => setReplyText(e.target.value)} />
                            <button className="btn" disabled={replyBusy} onClick={() => addReply(c._id)}>Reply</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Write a comment" value={commentText} onChange={e => setCommentText(e.target.value)} />
                <button className="btn" disabled={commentBusy} onClick={addComment}>Comment</button>
            </div>
        </div>
    );
}

export default function ReviewList({ movieId }) {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [limit, setLimit] = useState(5);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const qs = useMemo(() => new URLSearchParams({ page, limit }).toString(), [page, limit]);

    async function load() {
        setLoading(true);
        try {
            const data = await get(`/movies/${movieId}/reviews?${qs}`);
            setItems(data.items || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [movieId, qs]);

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            {loading
                ? Array.from({ length: limit }).map((_, i) => (<div key={i} className="card" style={{ height: 120, opacity: .5 }} />))
                : items.map(r => (<ReviewItem key={r._id} r={r} onRefresh={load} />))
            }
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
