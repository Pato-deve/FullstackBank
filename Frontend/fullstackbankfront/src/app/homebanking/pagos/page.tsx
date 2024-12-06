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
        setUsuarioId(data.id);
      } catch (err) {
        setError("Ocurrió un error al cargar los detalles del usuario.");
      }
    }

    fetchUsuario();
  }, []);

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
            setCuentaId(data[0].id);
            setBalance({
              pesos: data[0].balance_pesos,
              dolares: data[0].balance_dolares,
            });
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
          cuenta: cuentaId,
          fecha_pago: new Date().toISOString(),
          estado: "pendiente",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Error al realizar el pago.");
        return;
      }

      const newPago = await res.json();
      setPagos((prev) => [newPago, ...prev]);

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
      <div className="max-w-4xl mx-auto bg-gray-50 shadow-lg rounded-lg p-8">
        <div className="bg-gray-800 bg-opacity-5 p-5 m-2 rounded-xl shadow-inner shadow hover:shadow-lg text-center text-gray-800 max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Mis Pagos</h2>
          <p className="text-sm text-gray-600">Consulta y gestiona tus pagos realizados de manera fácil y rápida</p>
        </div>

        {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-center">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a9 9 0 11-6-8.485"/>
              </svg>
              {error}
            </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-sm text-gray-700 mb-4">
            <strong>Balance:</strong>{" "}
            {balance.pesos
                ? new Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS"}).format(balance.pesos)
                : "$0"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {pagos.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pagos.map((pago) => (
                    <li
                        key={pago.id}
                        className="py-4 flex justify-between items-center hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="text-gray-800 font-medium">
                          <strong>Fecha y Hora:</strong> {new Date(pago.fecha_pago).toLocaleString()}
                        </p>
                        <p className="text-gray-700">
                          <strong>Servicio:</strong> {pago.servicio}
                        </p>
                        <p className="text-gray-700">
                          <strong>Monto:</strong>{" "}
                          {new Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS"}).format(pago.monto)}
                        </p>
                        <p
                            className={`flex items-center font-bold ${
                                pago.estado === "pendiente" ? "text-yellow-500" : "text-green-500"
                            }`}
                        >
                          {pago.estado === "pendiente" ? (
                              <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 16h-1v-4h-1m1-4h.01"
                                  />
                                </svg>
                                Pendiente
                              </>
                          ) : (
                              <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Completado
                              </>
                          )}
                        </p>
                      </div>
                    </li>
                ))}
              </ul>
          ) : (
              <p className="text-gray-500 text-center">No has realizado pagos aún.</p>
          )}
        </div>

        <div className="flex justify-center mt-10">
          <button
              onClick={handleModalOpen}
              className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-white hover:text-black border-2 border-black focus:outline-none focus:ring-4 focus:ring-gray-500"
          >
            Realizar Nuevo Pago
          </button>
        </div>

        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Nuevo Pago</h3>
                <form onSubmit={handlePago}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder="Ejemplo: 1500"
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-700"
                        required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
                    <select
                        value={servicio}
                        onChange={(e) => setServicio(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-700"
                        required
                    >
                      <option value="" disabled>
                        Seleccione un servicio
                      </option>
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
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 mr-2 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-white hover:text-black border-2 border-black"
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
