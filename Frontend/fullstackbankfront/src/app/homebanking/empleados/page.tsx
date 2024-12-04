"use client";

import { useEffect, useState } from "react";

type Prestamo = {
  id: number;
  cuenta: number;
  monto_prestado: string;
  interes: string;
  pago_total: string;
  cuota_mensual: string;
  meses_duracion: number;
  estado: string;
};

export default function PanelEmpleados() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPrestamos = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró un token de autenticación. Por favor, inicie sesión.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/finanzas/prestamos/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al obtener los préstamos.");
      }

      const data = await res.json();
      setPrestamos(data);
    } catch (err: any) {
      console.error("Error al obtener los préstamos:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const anularPrestamo = async (prestamoId: number) => {
    setError(null);
    setSuccessMessage(null);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró un token de autenticación. Por favor, inicie sesión.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/finanzas/prestamos/${prestamoId}/anular/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al anular el préstamo.");
      }

      setSuccessMessage("El préstamo ha sido anulado correctamente.");
      // Actualizar la lista de préstamos
      setPrestamos((prev) => prev.filter((prestamo) => prestamo.id !== prestamoId));
    } catch (err: any) {
      console.error("Error al anular el préstamo:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Empleados - Gestión de Préstamos</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{successMessage}</div>}

      {loading ? (
        <p className="text-gray-500">Cargando préstamos...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4">
          {prestamos.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {prestamos.map((prestamo) => (
                <li key={prestamo.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-800 font-medium">Préstamo #{prestamo.id}</p>
                    <p className="text-gray-500 text-sm">
                      <strong>Monto:</strong> ${parseFloat(prestamo.monto_prestado).toFixed(2)} |
                      <strong> Estado:</strong> {prestamo.estado} |
                      <strong> Meses:</strong> {prestamo.meses_duracion}
                    </p>
                    <p className="text-gray-500 text-sm">
                      <strong>Pago Total:</strong> ${parseFloat(prestamo.pago_total).toFixed(2)} |
                      <strong> Cuota Mensual:</strong> ${parseFloat(prestamo.cuota_mensual).toFixed(2)}
                    </p>
                  </div>
                  {prestamo.estado === "activo" && (
                    <button
                      onClick={() => anularPrestamo(prestamo.id)}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Anular
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay préstamos disponibles para gestionar.</p>
          )}
        </div>
      )}
    </div>
  );
}
