"use client";

import { useState } from "react";

type Tarjeta = {
  id: number;
  numero_tarjeta: string;
  tipo_tarjeta: string;
  proveedor: string;
  cuenta: number;
};

export default function BuscarTarjetas() {
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const buscarTarjetas = async () => {
    setError(null);
    setTarjetas([]);
    setLoading(true);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró un token de autenticación. Por favor, inicie sesión.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/finanzas/tarjetas/buscar_por_usuario/?usuario_id=${usuarioId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al buscar las tarjetas.");
      }

      const data = await res.json();
      setTarjetas(data);
    } catch (err: any) {
      console.error("Error al buscar tarjetas:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Buscar Tarjetas por Usuario</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      <div className="flex space-x-4 items-center mb-6">
        <input
          type="text"
          placeholder="Ingrese ID del Usuario"
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={buscarTarjetas}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Buscando tarjetas...</p>
      ) : tarjetas.length > 0 ? (
        <ul className="divide-y divide-gray-200 bg-white shadow-md rounded-lg p-4">
          {tarjetas.map((tarjeta) => (
            <li key={tarjeta.id} className="py-4">
              <p className="text-gray-800 font-medium">Número de Tarjeta: {tarjeta.numero_tarjeta}</p>
              <p className="text-gray-500">
                <strong>Tipo:</strong> {tarjeta.tipo_tarjeta} | <strong>Proveedor:</strong> {tarjeta.proveedor}
              </p>
              <p className="text-gray-500">
                <strong>Cuenta ID:</strong> {tarjeta.cuenta}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No se encontraron tarjetas para el usuario ingresado.</p>
      )}
    </div>
  );
}
