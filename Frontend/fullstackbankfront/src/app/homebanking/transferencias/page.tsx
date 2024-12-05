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
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Transferencias</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-6">
        <p className="text-sm text-gray-700 mb-4">
          <strong>Balance:</strong>{" "}
          {balance.pesos
            ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(balance.pesos)
            : "$0"}
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      >
        Realizar Transferencia
      </button>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Transferencias realizadas</h3>
        <ul>
          {transferencias.map((transferencia, index) => (
            <li key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p><strong>Tipo:</strong> {transferencia.cuenta_origen === cuentaId ? "Enviada" : "Recibida"}</p>

              <p><strong>Emisor:</strong> {transferencia.cuenta_origen === cuentaId ? usernameLogueado : transferencia.username_emisor}</p>

              <p><strong>Destinatario:</strong> {transferencia.cuenta_origen === cuentaId ? transferencia.username_receptor : usernameLogueado}</p>

              <p><strong>Monto:</strong> {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(transferencia.monto)}</p>

              <p><strong>Fecha:</strong> {formatFecha(transferencia.fecha)}</p>
              {transferencia.descripcion && <p><strong>Descripción:</strong> {transferencia.descripcion}</p>}
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Nueva Transferencia</h3>
            <form onSubmit={handleTransferencia}>
              <div className="mb-4">
                <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700">Destinatario (Username o Número de Cuenta)</label>
                <input
                  id="destinatario"
                  type="text"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700">Monto</label>
                <input
                  id="monto"
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                <input
                  id="descripcion"
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Transferir
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
