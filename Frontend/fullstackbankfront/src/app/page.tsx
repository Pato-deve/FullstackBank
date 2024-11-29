'use client';  // Add this directive at the top of the file

import React, { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');  // Estado para el nombre de usuario
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);  // Estado para alternar entre login y registro

  const [firstName, setFirstName] = useState('');  // Estado para el nombre
  const [lastName, setLastName] = useState('');  // Estado para el apellido
  const [email, setEmail] = useState('');  // Estado para el email

  // Función para manejar el inicio de sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/usuarios/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: username,
        password: password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Redirigir a la página principal
      window.location.href = '/homebanking';
    } else {
      // Manejar error
      setError(data.error || 'Algo salió mal');
    }
  };

  // Función para manejar el registro de usuario
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const res = await fetch('http://localhost:8000/api/usuarios/registro/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = '/homebanking';
    } else {
      setError(data.detail || 'Algo salió mal durante el registro');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
        className="w-full max-w-sm bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        <h2 className="text-2xl mb-4 font-bold text-center">
          {isRegistering ? 'Registro' : 'Inicio de Sesión'}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {isRegistering && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                Nombre
              </label>
              <input
                id="first_name"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                Apellido
              </label>
              <input
                id="last_name"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col items-center">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
          <button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-100 transition"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
