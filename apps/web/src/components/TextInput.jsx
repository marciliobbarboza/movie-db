import React from 'react';

export default function TextInput({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
    return (
        <div className="row">
            <label>{label}</label>
            <input
                className="input"
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />
        </div>
    );
}
