// apps/web/src/services/api.js
const BASE = '/api';

function authHeaders() {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function post(path, body) {
    const r = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || 'error');
    return data;
}

export async function get(path) {
    const r = await fetch(`${BASE}${path}`, { headers: { ...authHeaders() } });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || 'error');
    return data;
}

export async function del(path) {
    const r = await fetch(`${BASE}${path}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.message || 'error');
    }
    return {};
}

export async function put(path, body) {
    const r = await fetch(`${BASE}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || 'error');
    return data;
}
