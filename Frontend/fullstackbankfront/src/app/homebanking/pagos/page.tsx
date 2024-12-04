"use client";

import { useState, useEffect } from "react";

interface Pago {
  id: string;
  servicio: string;
  monto: number;
  estado: string;
  fecha_pago: string;
}

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [monto, setMonto] = useState<string>("");
  const [servicio, setServicio] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [cuentaId, setCuentaId] = useState<number | null>(null);
  const [balance, setBalance] = useState<{ pesos: number; dolares: number }>({
    pesos: 0,
    dolares: 0,
  });

  // Cargar los detalles del usuario
  useEffect(() => {
    async function fetchUsuario() {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:8000/api/usuarios/detalle/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Error al cargar los detalles del usuario.");
        }

        const data = await res.json();
        setUsuarioId(data.id); // Guardar el ID del usuario
      } catch (err) {
        setError("Ocurrió un error al cargar los detalles del usuario.");
      }
    }

    fetchUsuario();
  }, []);

  // Cargar las cuentas del usuario
  useEffect(() => {
    if (usuarioId !== null) {
      async function fetchCuentas() {
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch(`http://localhost:8000/api/finanzas/cuentas/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error("Error al cargar las cuentas.");
          }

          const data = await res.json();
          if (data.length > 0) {
            setCuentaId(data[0].id); // Asumiendo que la cuenta del usuario es la primera
            setBalance({
              pesos: data[0].balance_pesos,
              dolares: data[0].balance_dolares,
            }); // Asignar el balance
          } else {
            setError("No se ha encontrado la cuenta del usuario.");
          }
        } catch (err) {
          setError("Ocurrió un error al cargar las cuentas.");
        }
      }

      fetchCuentas();
    }
  }, [usuarioId]);

  // Cargar los pagos realizados
  useEffect(() => {
    if (usuarioId !== null) {
      async function fetchPagos() {
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch(`http://localhost:8000/api/finanzas/pagos/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error("No se pudieron obtener los pagos realizados.");
          }

          const data = await res.json();
          // Ordenar los pagos de más reciente a más antiguo, incluyendo la hora
          const pagosOrdenados = data.sort((a: Pago, b: Pago) =>
            new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime()
          );
          setPagos(pagosOrdenados);
        } catch (err) {
          setError("Ocurrió un error al obtener los pagos.");
        }
      }

      fetchPagos();
    }
  }, [usuarioId]);

  const handlePago = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:8000/api/finanzas/pagos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monto: parseFloat(monto),
          servicio,
          cuenta: cuentaId, // Aquí usamos el cuentaId que hemos obtenido
          fecha_pago: new Date().toISOString(), // Fecha y hora actual
          estado: "pendiente", // Estado inicial como pendiente
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Error al realizar el pago.");
        return;
      }

      const newPago = await res.json();
      setPagos((prev) => [newPago, ...prev]); // Insertar nuevo pago al principio de la lista

      // Actualizar balance después de realizar el pago
      setBalance((prevBalance) => ({
        pesos: prevBalance.pesos - parseFloat(monto),
        dolares: prevBalance.dolares,
      }));

      setMonto("");
      setServicio("");
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

      {/* Información del balance */}
      <div className="mb-6">
        <p className="text-sm text-gray-700 mb-4">
          <strong>Balance:</strong>
          {balance.pesos
            ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(balance.pesos)
            : "$0"}
        </p>
      </div>

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
                    <strong>Fecha y Hora:</strong>{" "}
                    {new Date(pago.fecha_pago).toLocaleString()} {/* Fecha y hora */}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Servicio:</strong> {pago.servicio}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Monto:</strong> ${pago.monto}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Estado:</strong> {pago.estado === "pendiente" ? "Pendiente" : pago.estado}
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
                  <option value="Escolar">Escolar</option>
                  <option value="Varios">Varios</option>
                  <option value="Internet">Internet</option>
                  <option value="Luz">Luz</option>
                  <option value="Comida">Comida</option>
                  <option value="Viaje">Viaje</option>
                  <option value="Negocios">Negocios</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Confirmar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
