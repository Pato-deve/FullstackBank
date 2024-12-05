"use client"; // Asegura que este componente se ejecute del lado del cliente

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Importar js-cookie para manejar cookies

const ChangeDirPage = () => {
  const [searchQuery, setSearchQuery] = useState(""); // ID o Username
  const [newAddress, setNewAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null); // Estado para el token

  useEffect(() => {
    // Usamos js-cookie para recuperar el token de las cookies
    const authToken = Cookies.get("authToken");
    setToken(authToken); // Establecemos el token en el estado cuando el componente se monta
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!searchQuery.trim() || !newAddress.trim()) {
      setError("Please enter an ID/username and a new address.");
      return;
    }

    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Llamada a la API para actualizar la dirección del usuario
      const response = await axios.put(
        "http://localhost:8000/api/usuarios/actualizar-direccion/",
        {
          username_or_id: searchQuery,
          direccion: newAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluye el token JWT
          },
        }
      );

      // Mostrar mensaje de éxito
      const message = response.data.mensaje || "Address updated successfully.";
      setSuccess(message);
    } catch (err: any) {
      // Manejo de errores
      const errorMessage =
        err.response?.data?.error || "There was an error updating the address.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-4 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Change User Address
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">
              Username or ID:
            </label>
            <input
              id="searchQuery"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Enter Username or ID"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newAddress" className="block text-sm font-medium text-gray-700">
              New Address:
            </label>
            <input
              id="newAddress"
              type="text"
              value={newAddress}
              onChange={handleAddressChange}
              placeholder="Enter the new address"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Updating..." : "Update Address"}
          </button>
        </form>

        {/* Mensajes de éxito o error */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default ChangeDirPage;
