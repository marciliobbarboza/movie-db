import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, put } from '../services/api.js';

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
            const res = String(fr.result || '');
            const [, meta, data] = res.match(/^data:(.*?);base64,(.*)$/) || [];
            if (!data) return reject(new Error('invalid'));
            resolve({ contentType: meta, data });
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}

export default function Account() {
    const nav = useNavigate();
    const [me, setMe] = useState(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    async function load() {
        try {
            const u = await get('/users/me');
            setMe(u);
            setName(u.name || '');
        } catch (e) {
            setErr('failed');
        }
    }

    async function save(e) {
        e.preventDefault();
        try {
            setBusy(true);
            setErr('');
            let avatar = null;
            if (avatarFile) {
                avatar = await toBase64(avatarFile);
            }
            const payload = { name };
            if (password) payload.password = password;
            if (avatar) payload.avatar = avatar;
            const u = await put('/users/me', payload);
            localStorage.setItem('user', JSON.stringify(u));
            await load();
            setPassword('');
            setAvatarFile(null);
        } catch (e) {
            setErr('save_error');
        } finally {
            setBusy(false);
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        nav('/login', { replace: true });
    }

    useEffect(() => { load(); }, []);

    return (
        <div className="container">
            <header className="header" style={{ gap: 12 }}>
                <h1 style={{ marginRight: 'auto' }}>My Profile</h1>
                <Link className="btn-secondary" to="/">Home</Link>
            </header>

            <div className="card" style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: '#0b1324', border: '1px solid #1f2937', display: 'grid', placeItems: 'center' }}>
                        {me ? (
                            <img
                                key={me._id + (me.updatedAt || '')}
                                src={`/api/users/${me._id}/avatar?ts=${Date.now()}`}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                alt="avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : null}
                    </div>
                    <div>
                        <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
                    </div>
                </div>

                <form className="form" onSubmit={save} style={{ gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="row">
                        <label>Name</label>
                        <input className="input" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="row">
                        <label>New password</label>
                        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep" />
                    </div>
                    {err ? <div style={{ color: '#ef4444', fontSize: 14 }}>Save failed</div> : null}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn-secondary" type="button" onClick={logout}>Sign out</button>
                        <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
