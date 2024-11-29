'use client';

import React, { useState } from 'react';
import Cookies from 'js-cookie'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://127.0.0.1:8000/api/usuarios/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Login failed:', errorData);
      setError(errorData.error || 'Something went wrong');
    return;
}
    if (res.ok) {
      localStorage.setItem('authToken', data.access);
      Cookies.set('authToken', data.access, {
        path: '/',
        sameSite: 'None',
        secure: true,
      });

      window.location.href = '/homebanking';
    } else {
      setError(data.error || 'Something went wrong');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
