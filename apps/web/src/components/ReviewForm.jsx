// apps/web/src/components/ReviewForm.jsx
import React, { useState } from 'react';
import { post } from '../services/api.js';

export default function ReviewForm({ movieId, onCreated }) {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(e) {
        e.preventDefault();
        try {
            setBusy(true);
            await post(`/movies/${movieId}/reviews`, { rating: Number(rating), text });
            setText('');
            if (onCreated) onCreated();
        } finally {
            setBusy(false);
        }
    }

    return (
        <form className="form" onSubmit={submit} style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <div className="row">
                <label>Rating</label>
                <input className="input" type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} />
            </div>
            <div className="row">
                <label>Review</label>
                <textarea className="input" rows="4" value={text} onChange={e => setText(e.target.value)} placeholder="Share your thoughts" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn" disabled={busy} type="submit">Post</button>
            </div>
        </form>
    );
}
