"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [sucursal, setSucursal] = useState<string | null>(null);
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
      const userResponse = await fetch("http://localhost:8000/api/usuarios/detalle/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || "Error al obtener los datos del empleado.");
      }

      const userData = await userResponse.json();
      setSucursal(userData.sucursal?.nombre || "Sin sucursal");

      const prestamosResponse = await fetch("http://localhost:8000/api/finanzas/prestamos/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!prestamosResponse.ok) {
        const errorData = await prestamosResponse.json();
        throw new Error(errorData.error || "Error al obtener los préstamos.");
      }

      const prestamosData = await prestamosResponse.json();
      setPrestamos(prestamosData);
    } catch (err: any) {
      console.error("Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarPrestamo = async (prestamoId: number, accion: "anular" | "rechazar" | "aprobar") => {
    setError(null);
    setSuccessMessage(null);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró un token de autenticación. Por favor, inicie sesión.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/finanzas/prestamos/${prestamoId}/${accion}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error al realizar la acción: ${accion}.`);
      }

      const updatedPrestamo = await res.json();
      setSuccessMessage(`El préstamo ha sido ${accion === "aprobar" ? "aprobado" : accion} correctamente.`);
      setPrestamos((prev) =>
        prev.map((prestamo) => (prestamo.id === updatedPrestamo.prestamo.id ? updatedPrestamo.prestamo : prestamo))
      );
    } catch (err: any) {
      console.error(`Error al realizar la acción: ${accion}`, err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "aprobado":
        return "bg-green-100 text-green-800";
      case "rechazado":
        return "bg-red-100 text-red-800";
      case "anulado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Panel de Empleados - {sucursal || "Cargando..."}
      </h1>
      <Link href="/homebanking/empleados/findTarjeta" className="text-blue-500 hover:underline">
        Buscar tarjetas de un usuario
      </Link>
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
                      <strong> Estado:</strong>{" "}
                      <span className={`px-2 py-1 rounded ${getEstadoColor(prestamo.estado)}`}>{prestamo.estado}</span> |
                      <strong> Meses:</strong> {prestamo.meses_duracion}
                    </p>
                    <p className="text-gray-500 text-sm">
                      <strong>Pago Total:</strong> ${parseFloat(prestamo.pago_total).toFixed(2)} |
                      <strong> Cuota Mensual:</strong> ${parseFloat(prestamo.cuota_mensual).toFixed(2)}
                    </p>
                  </div>
                  {prestamo.estado === "pendiente" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => actualizarPrestamo(prestamo.id, "aprobar")}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => actualizarPrestamo(prestamo.id, "rechazar")}
                        className="px-4 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                  {prestamo.estado === "aprobado" && (
                    <button
                      onClick={() => actualizarPrestamo(prestamo.id, "anular")}
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