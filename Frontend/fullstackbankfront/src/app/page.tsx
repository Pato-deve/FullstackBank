'use client';

import React, { useState } from 'react';
import ConceptArtLogin from "@/app/Background";
import Cookies from 'js-cookie';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/usuarios/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar el token en localStorage y en cookies
      localStorage.setItem('authToken', data.access);
      Cookies.set('authToken', data.access, {
        path: '/',
        sameSite: 'None',
        secure: true,
      });

      window.location.href = '/homebanking';
    } else {
      setError(data.error || 'Algo salió mal');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/usuarios/registro/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar el token en localStorage y en cookies
      localStorage.setItem('authToken', data.access);
      Cookies.set('authToken', data.access, {
        path: '/',
        sameSite: 'None',
        secure: true,
      });

      window.location.href = '/homebanking';
    } else {
      setError(data.detail || 'Algo salió mal durante el registro');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side: Illustration */}
      <div className="hidden md:flex w-3/4 bg-gray-100 items-center justify-center">
        <ConceptArtLogin></ConceptArtLogin>
      </div>

      {/* Right side: Form */}
      <div className="flex w-full md:w-1/4 h-full bg-white shadow-lg flex-col">
        {/* Toggle Buttons */}
        <div className="flex justify-around items-center py-4 border-b">
          <button
            className={`text-lg font-semibold pb-2 ${
              !isRegistering ? 'border-b-2 border-black' : 'text-gray-500'
            }`}
            onClick={() => setIsRegistering(false)}
          >
            Soy cliente
          </button>
          <button
            className={`text-lg font-semibold pb-2 ${
              isRegistering ? 'border-b-2 border-black' : 'text-gray-500'
            }`}
            onClick={() => setIsRegistering(true)}
          >
            No soy cliente
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
          className="flex flex-col justify-center items-center h-full px-8"
        >
          <h2 className="text-3xl mb-6 font-bold text-center">
            {isRegistering ? 'Registro' : 'Inicio de Sesión'}
          </h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {isRegistering && (
            <>
              <div className="mb-4 w-full">
                <label
                  htmlFor="first_name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Nombre
                </label>
                <input
                  id="first_name"
                  type="text"
                  className="input-default w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 w-full">
                <label
                  htmlFor="last_name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Apellido
                </label>
                <input
                  id="last_name"
                  type="text"
                  className="input-default w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 w-full">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-default w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4 w-full">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              className="input-default w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 w-full">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="input-default w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
