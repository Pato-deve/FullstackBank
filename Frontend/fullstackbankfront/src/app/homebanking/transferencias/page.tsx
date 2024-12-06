"use client";

import { useState, useEffect } from "react";

interface Cuenta {
  id: number;
  balance_pesos: number;
  balance_dolares: number;
}

interface Transferencia {
  monto: number;
  descripcion: string;
  fecha: string;
  cuenta_destino: string;
  cuenta_origen: string;
  username_emisor: string;
  username_receptor: string;
}

export default function Transferencias() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [cuentaId, setCuentaId] = useState<number | null>(null);
  const [balance, setBalance] = useState<{ pesos: number; dolares: number }>({
    pesos: 0,
    dolares: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [destinatario, setDestinatario] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usernameLogueado, setUsernameLogueado] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
        setUsernameLogueado(data.username);
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
          const res = await fetch("http://localhost:8000/api/finanzas/cuentas/", {
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
      async function fetchTransferencias() {
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch("http://localhost:8000/api/finanzas/transferencias/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error("Error al cargar las transferencias.");
          }

          const data = await res.json();
          const transferenciasFiltradas = data.filter((transferencia: Transferencia) => 
            transferencia.cuenta_origen === cuentaId || transferencia.cuenta_destino === cuentaId
          );
          setTransferencias(transferenciasFiltradas.reverse());
        } catch (err) {
          setError("Ocurrió un error al cargar las transferencias.");
        }
      }

      fetchTransferencias();
    }
  }, [usuarioId, cuentaId]);

  const handleTransferencia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:8000/api/finanzas/transferencias/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monto: parseFloat(monto),
          descripcion: descripcion,
          destinatario: destinatario,
          cuenta_origen: cuentaId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Error al realizar la transferencia.");
        return;
      }

      setBalance((prevBalance) => ({
        pesos: prevBalance.pesos - parseFloat(monto), // Restamos del balance
        dolares: prevBalance.dolares,
      }));

      setMonto("");
      setDestinatario("");
      setDescripcion("");
      setIsModalOpen(false);

      const resTransferencias = await fetch("http://localhost:8000/api/finanzas/transferencias/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const dataTransferencias = await resTransferencias.json();
      const transferenciasFiltradas = dataTransferencias.filter(
        (transferencia: Transferencia) =>
          transferencia.cuenta_origen === cuentaId || transferencia.cuenta_destino === cuentaId
      );
      setTransferencias(transferenciasFiltradas.reverse());
    } catch (err) {
      setError("Ocurrió un error al procesar la transferencia.");
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString("es-AR", {
      weekday: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  return (
      <div className="max-w-4xl mx-auto bg-gray-50 shadow-lg rounded-lg p-8">
        <div className="bg-gray-800 bg-opacity-5 p-6 m-2 rounded-xl shadow-inner shadow hover:shadow-lg text-center text-gray-800 max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Transferencias</h2>
          <p className="text-sm text-gray-600">Consulta y realiza transferencias de forma segura y sencilla.</p>
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

        <div className="flex justify-center mb-6">
          <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-white hover:text-black border-2 border-black focus:outline-none focus:ring-4 focus:ring-gray-500"
          >
            Realizar Transferencia
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Transferencias realizadas</h3>
          {transferencias.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {transferencias.map((transferencia, index) => (
                    <li key={index}
                        className="py-4 flex justify-between items-center hover:bg-gray-50 rounded-lg transition-colors">
                      <div>
                        <p className="text-gray-800 font-medium">
                          <strong>Tipo:</strong> {transferencia.cuenta_origen === cuentaId ? "Enviada" : "Recibida"}
                        </p>
                        <p className="text-gray-700">
                          <strong>Emisor:</strong>{" "}
                          {transferencia.cuenta_origen === cuentaId ? usernameLogueado : transferencia.username_emisor}
                        </p>
                        <p className="text-gray-700">
                          <strong>Destinatario:</strong>{" "}
                          {transferencia.cuenta_origen === cuentaId ? transferencia.username_receptor : usernameLogueado}
                        </p>
                        <p className="text-gray-700">
                          <strong>Monto:</strong>{" "}
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS"
                          }).format(transferencia.monto)}
                        </p>
                        <p className="text-gray-700">
                          <strong>Fecha:</strong> {formatFecha(transferencia.fecha)}
                        </p>
                        {transferencia.descripcion && (
                            <p className="text-gray-700">
                              <strong>Descripción:</strong> {transferencia.descripcion}
                            </p>
                        )}
                      </div>
                    </li>
                ))}
              </ul>
          ) : (
              <p className="text-gray-500 text-center">No se han realizado transferencias aún.</p>
          )}
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Nueva Transferencia</h3>
                <form onSubmit={handleTransferencia}>
                  <div className="mb-4">
                    <label
                        htmlFor="destinatario"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Destinatario (Username o Número de Cuenta)
                    </label>
                    <input
                        id="destinatario"
                        type="text"
                        value={destinatario}
                        onChange={(e) => setDestinatario(e.target.value)}
                        placeholder="Ejemplo: user123 o 123-45678"
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-700"
                        required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                        htmlFor="monto"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Monto
                    </label>
                    <input
                        id="monto"
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder="Ejemplo: 1000"
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-700"
                        required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                        htmlFor="descripcion"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Descripción (Opcional)
                    </label>
                    <input
                        id="descripcion"
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Ejemplo: Pago de servicios"
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-700"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 mr-2 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-white hover:text-black border-2 border-black"
                        disabled={loading}
                    >
                      {loading ? "Procesando..." : "Confirmar Transferencia"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>

  );
}
