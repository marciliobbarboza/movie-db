// apps/web/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Users from './pages/Users.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Movie from './pages/Movie.jsx';
import Account from './pages/Account.jsx';

function useAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return { token, user: user ? JSON.parse(user) : null };
}
function PrivateRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/watchlist" element={<PrivateRoute><Watchlist /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/users/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/movies/:id" element={<PrivateRoute><Movie /></PrivateRoute>} />
            <Route path="/me" element={<PrivateRoute><Account /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
        </Routes>
    );
}
