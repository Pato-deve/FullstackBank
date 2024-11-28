"use client";

import { useState, useEffect } from "react";
import apiClient from "../../apiClient"; // Asegúrate de importar el apiClient

const Login = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Para manejar email en el registro
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegister, setIsRegister] = useState(false); // Toggle entre login y registro
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null); // Almacena detalles del usuario autenticado

  // Función para manejar el inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiClient.post("api/usuarios/login/", {
        username: username,
        password: password,
      });

      const { access } = response.data;
      localStorage.setItem("token", access); // Almacenar token JWT en localStorage
      window.location.href = "/homebanking"; // Redirigir a la página principal
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error durante el inicio de sesión");
    }
  };

  // Función para manejar el registro de usuario
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await apiClient.post("api/usuarios/registro/", {
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,
        password: password,
      });

      alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
      setIsRegister(false); // Cambiar al formulario de inicio de sesión
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error durante el registro");
    }
  };

  // Función para obtener detalles del usuario autenticado
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.get("api/usuarios/detalle/", {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir token en los headers
        },
      });
      setUserDetails(response.data); // Almacenar detalles del usuario
    } catch (err: any) {
      console.error("Error al obtener detalles del usuario:", err.response?.data || err.message);
      setError("No se pudieron cargar los detalles del usuario");
    }
  };

  // Usamos useEffect para cargar los detalles del usuario si el token existe
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserDetails();
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        className="w-full max-w-sm bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        <h2 className="text-2xl mb-4 font-bold text-center">
          {isRegister ? "Registro" : "Inicio de Sesión"}
        </h2>
        {isRegister && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Apellido
              </label>
              <input
                id="lastName"
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
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="flex flex-col items-center">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            {isRegister ? "Registrarse" : "Iniciar Sesión"}
          </button>
          <button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-100 transition"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia Sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
        {userDetails && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <h3 className="text-lg font-bold">Detalles del Usuario:</h3>
            <p><strong>Nombre:</strong> {userDetails.first_name} {userDetails.last_name}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
