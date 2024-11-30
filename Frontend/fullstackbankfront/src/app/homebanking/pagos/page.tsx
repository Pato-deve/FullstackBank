"use client";

import { useState, useEffect } from "react";

interface Pago {
  id: string;
  fecha: string;
  servicio: string;
  monto: number;
  estado: "aprobado" | "rechazado";
}

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [monto, setMonto] = useState<string>("");
  const [servicio, setServicio] = useState<string>("");
  const [estado, setEstado] = useState<"aprobado" | "rechazado">("aprobado");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar los pagos realizados al cargar la página
  useEffect(() => {
    async function fetchPagos() {
      try {
        const token = localStorage.getItem("authToken");

        const res = await fetch("/api/pagos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Error al cargar los pagos.");
        }

        const data = await res.json();
        setPagos(data);
      } catch (err) {
        setError("Ocurrió un error al cargar los pagos.");
      }
    }

    fetchPagos();
  }, []);

  const handlePago = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monto: parseFloat(monto),
          servicio,
          estado,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Error al realizar el pago.");
        return;
      }

      const newPago = await res.json();
      setPagos((prev) => [newPago, ...prev]);
      setMonto("");
      setServicio("");
      setEstado("aprobado");
      setShowModal(false);
    } catch (err) {
      setError("Ocurrió un error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Mis Pagos</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Lista de pagos */}
      <div className="mb-6">
        {pagos.length > 0 ? (
          <ul>
            {pagos.map((pago) => (
              <li
                key={pago.id}
                className="border-b border-gray-200 py-2 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Fecha:</strong> {new Date(pago.fecha).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Servicio:</strong> {pago.servicio}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Monto:</strong> ${pago.monto.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Estado:</strong> {pago.estado === "aprobado" ? "Aprobado" : "Rechazado"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No has realizado pagos aún.</p>
        )}
      </div>

      {/* Botón para abrir el modal de nuevo pago */}
      <button
        onClick={handleModalOpen}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Realizar Nuevo Pago
      </button>

      {/* Modal para realizar un nuevo pago */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Nuevo Pago</h3>
            <form onSubmit={handlePago}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio
                </label>
                <select
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required
                >
                  <option value="" disabled>
                    Seleccione un tipo de servicio
                  </option>
                  <option value="escolar">Escolar</option>
                  <option value="varios">Varios</option>
                  <option value="comida">Comida</option>
                  <option value="viaje">Viaje</option>
                  <option value="negocios">Negocios</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Pago
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as "aprobado" | "rechazado")}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required
                >
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              <button
                type="submit"
                className={`w-full px-4 py-2 text-white rounded ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Realizar Pago"}
              </button>
            </form>

            <button
              onClick={handleModalClose}
              className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
