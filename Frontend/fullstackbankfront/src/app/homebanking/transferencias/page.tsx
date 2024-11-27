"use client";

import { useEffect, useState } from "react";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
}

interface Transferencia {
  id: string;
  destinatario: string;
  monto: number;
  descripcion: string;
  fecha: string;
}

export default function Transferencias() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [monto, setMonto] = useState<string>("");
  const [destinatario, setDestinatario] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTransferencia, setSelectedTransferencia] = useState<Transferencia | null>(null);

  // Cargar transferencias realizadas y usuarios al cargar la página
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("authToken");

        // Cargar transferencias
        const resTransferencias = await fetch("/api/transferencias", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resTransferencias.ok) {
          throw new Error("Error al cargar las transferencias.");
        }

        const dataTransferencias = (await resTransferencias.json()) as Transferencia[];
        setTransferencias(dataTransferencias);

        // Cargar usuarios
        const resUsuarios = await fetch("/api/usuarios", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resUsuarios.ok) {
          throw new Error("Error al cargar los usuarios.");
        }

        const dataUsuarios = (await resUsuarios.json()) as Usuario[];
        setUsuarios(dataUsuarios);
      } catch (err) {
        setError("Ocurrió un error al cargar los datos.");
      }
    }

    fetchData();
  }, []);

  const handleTransferencia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/transferencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monto: parseFloat(monto),
          destinatarioId: destinatario,
          descripcion,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Error al realizar la transferencia.");
        return;
      }

      const newTransferencia = await res.json();
      setSuccessMessage("¡Transferencia realizada con éxito!");
      setTransferencias((prev) => [newTransferencia, ...prev]);
      setMonto("");
      setDestinatario("");
      setDescripcion("");
      setShowModal(false); // Cerrar el modal después de enviar la transferencia
    } catch (err) {
      setError("Ocurrió un error al procesar la transferencia.");
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

  const handleModalDetailsOpen = (transferencia: Transferencia) => {
    setSelectedTransferencia(transferencia);
    setShowModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Mis Transferencias</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

      {/* Lista de transferencias */}
      <div className="mb-6">
        {transferencias.length > 0 ? (
          <ul>
            {transferencias.map((transferencia) => (
              <li
                key={transferencia.id}
                className="border-b border-gray-200 py-2 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Destinatario:</strong> {transferencia.destinatario}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Monto:</strong> ${transferencia.monto.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Fecha:</strong> {new Date(transferencia.fecha).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleModalDetailsOpen(transferencia)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Ver Detalles
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No has realizado transferencias aún.</p>
        )}
      </div>

      {/* Botón para abrir el modal de nueva transferencia */}
      <button
        onClick={handleModalOpen}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Realizar Nueva Transferencia
      </button>

      {/* Modal para realizar una nueva transferencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Nueva Transferencia</h3>
            <form onSubmit={handleTransferencia}>
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
                  Destinatario
                </label>
                <select
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required
                >
                  <option value="" disabled>
                    Seleccione un destinatario
                  </option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} {usuario.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                />
              </div>

              <button
                type="submit"
                className={`w-full px-4 py-2 text-white rounded ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Enviar Transferencia"}
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
