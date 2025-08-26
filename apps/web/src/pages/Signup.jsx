import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../components/TextInput.jsx';
import { post } from '../services/api.js';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        if (!name || !email || !password) { setErr('Preencha todos os campos'); return; }
        try {
            setLoading(true);
            const res = await post('/auth/signup', { name, email, password });
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            nav('/');
        } catch (e) {
            setErr(e.message === 'email_in_use' ? 'E-mail já em uso' : 'Erro ao cadastrar');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="card">
                <h2 className="center">Criar conta</h2>
                <form className="form" onSubmit={onSubmit}>
                    <TextInput label="Nome" value={name} onChange={setName} placeholder="Seu nome" autoComplete="name" />
                    <TextInput label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" autoComplete="email" />
                    <TextInput label="Senha" type="password" value={password} onChange={setPass} placeholder="••••••••" autoComplete="new-password" />
                    {err && <div className="error">{err}</div>}
                    <button className="btn" type="submit" disabled={loading}>{loading ? 'Criando...' : 'Cadastrar'}</button>
                    <div className="mt center">
                        Já tem conta? <Link className="link" to="/login">Entrar</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
