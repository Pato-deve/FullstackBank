'use client';

import React, { useState, useEffect } from 'react';
import ConceptArtLogin from "@/app/Background";
import Cookies from 'js-cookie';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Campos de registro
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);
  
  // Obtener sucursales al cargar el componente
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/sucursales/');
        if (!res.ok) {
          throw new Error('No se pudieron cargar las sucursales');
        }
        const data = await res.json();
        setBranches(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchBranches();
  }, []);

  // Manejar inicio de sesión
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
      localStorage.setItem('authToken', data.access);
      Cookies.set('authToken', data.access, {
        path: '/',
        sameSite: 'None',
        secure: true,
      });

      localStorage.setItem('isEmpleado', data.es_empleado);
      window.location.href = '/homebanking';
    } else {
      setError(data.error || 'Algo salió mal');
    }
  };

  // Manejar registro de nuevo usuario
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
        telefono: phone,
        direccion: address,
        sucursal: selectedBranch,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('authToken', data.access);
      Cookies.set('authToken', data.access, {
        path: '/',
        sameSite: 'None',
        secure: true,
      });

      localStorage.setItem('isEmpleado', data.es_empleado);
      window.location.href = '/homebanking';
    } else {
      setError(data.detail || 'Algo salió mal durante el registro');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-3/4 bg-gray-100 items-center justify-center">
        <ConceptArtLogin />
      </div>

      <div className="flex w-full md:w-1/4 h-full bg-white shadow-lg flex-col">
        <div className="flex justify-around items-center py-4 border-b">
          <button
            className={`text-lg font-semibold pb-2 ${!isRegistering ? 'border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setIsRegistering(false)}
          >
            Soy cliente
          </button>
          <button
            className={`text-lg font-semibold pb-2 ${isRegistering ? 'border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setIsRegistering(true)}
          >
            No soy cliente
          </button>
        </div>

        <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="flex flex-col justify-center items-center h-full px-8">
          <h2 className="text-3xl mb-6 font-bold text-center">
            {isRegistering ? 'Registro' : 'Inicio de Sesión'}
          </h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {isRegistering && (
            <>
              <div className="mb-4 w-full">
                <label htmlFor="first_name" className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
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
                <label htmlFor="last_name" className="block text-gray-700 text-sm font-bold mb-2">Apellido</label>
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
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input-default w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 w-full">
                <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                <input
                  id="phone"
                  type="text"
                  className="input-default w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 w-full">
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Dirección</label>
                <input
                  id="address"
                  type="text"
                  className="input-default w-full"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 w-full">
                <label htmlFor="sucursal" className="block text-gray-700 text-sm font-bold mb-2">Sucursal</label>
                <select
                  id="sucursal"
                  className="input-default w-full"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  required
                >
                  <option value="">Selecciona una sucursal</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="mb-4 w-full">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Usuario</label>
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
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
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
