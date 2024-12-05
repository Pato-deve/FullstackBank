"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"; // Importamos desde next/navigation

const CambiarDirPage = () => {
  const [newAddress, setNewAddress] = useState(""); // Nueva dirección
  const [error, setError] = useState<string | null>(null); // Para los errores
  const [success, setSuccess] = useState<string | null>(null); // Mensaje de éxito
  const [loading, setLoading] = useState(false); // Estado de carga
  const [userId, setUserId] = useState<number | null>(null); // ID del usuario logueado
  const router = useRouter(); // Usamos el nuevo router de next/navigation

  // Obtener detalles del usuario logueado al cargar la página
  useEffect(() => {
    const token = Cookies.get("authToken");

    if (token) {
      axios
        .get("http://localhost:8000/api/usuarios/detalle/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserId(response.data.id);
        })
        .catch((err) => {
          setError("No se pudo obtener los detalles del usuario.");
        });
    } else {
      setError("No estás autenticado.");
    }
  }, []);

  // Controlador para el campo de nueva dirección
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress(e.target.value);
  };

  // Función para actualizar la dirección
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddress.trim()) {
      setError("Por favor ingresa una nueva dirección.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("No se pudo encontrar el token de autenticación.");
        setLoading(false);
        return;
      }

      const response = await axios.put(
        "http://localhost:8000/api/usuarios/actualizar-direccion/",
        {
          username_or_id: userId, // Usamos el ID del usuario logueado
          direccion: newAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Si la actualización es exitosa
      setSuccess("Dirección actualizada con éxito.");
      setNewAddress(""); // Limpiar el campo
      // Redirigir a homebanking
      router.push("/homebanking"); // Utilizamos router.push de next/navigation
    } catch (err: any) {
      setError(err.response?.data?.error || "Hubo un error al actualizar la dirección.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-md shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">Cambiar Dirección</h1>

      {/* Mensajes de error o éxito */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Formulario para cambiar dirección */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="newAddress" className="block text-sm font-medium text-gray-700">Nueva Dirección:</label>
          <input
            type="text"
            id="newAddress"
            value={newAddress}
            onChange={handleAddressChange}
            placeholder="Ingresa tu nueva dirección"
            required
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Actualizando..." : "Actualizar Dirección"}
        </button>
      </form>
    </div>
  );
};

export default CambiarDirPage;
