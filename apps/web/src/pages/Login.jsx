import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../components/TextInput.jsx';
import { post } from '../services/api.js';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        if (!email || !password) { setErr('Preencha e-mail e senha'); return; }
        try {
            setLoading(true);
            const res = await post('/auth/login', { email, password });
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            nav('/');
        } catch (e) {
            setErr(e.message === 'invalid_credentials' ? 'Credenciais inválidas' : 'Erro ao entrar');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="card">
                <h2 className="center">Entrar</h2>
                <form className="form" onSubmit={onSubmit}>
                    <TextInput label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" autoComplete="email" />
                    <TextInput label="Senha" type="password" value={password} onChange={setPass} placeholder="••••••••" autoComplete="current-password" />
                    {err && <div className="error">{err}</div>}
                    <button className="btn" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
                    <div className="mt center">
                        Não tem conta? <Link className="link" to="/signup">Cadastrar</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
