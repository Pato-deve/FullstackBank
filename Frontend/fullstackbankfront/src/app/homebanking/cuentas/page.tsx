"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/axiosConfig";

export default function Cuentas() {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [resumenFinanciero, setResumenFinanciero] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para la moneda seleccionada
  const [selectedCurrency, setSelectedCurrency] = useState<"pesos" | "dolares">("pesos");

  useEffect(() => {
    axiosInstance
      .get("/api/finanzas/cuentas/")
      .then((response) => {
        setCuentas(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar las cuentas.");
        setLoading(false);
      });

    axiosInstance
      .get("/api/finanzas/resumen/")
      .then((response) => {
        setResumenFinanciero(response.data);
      })
      .catch(() => {
        setError("Error al cargar el resumen financiero.");
      });
  }, []);

  if (loading) {
    return <div className="text-center">Cargando cuentas...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!resumenFinanciero) {
    return <div className="text-center">Datos del resumen financiero no disponibles.</div>;
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        {/* Contenedor para la cuenta */}
        <div className="bg-gray-800 bg-opacity-5 p-6 rounded-xl shadow-inner shadow hover:shadow-lg text-center text-gray-800 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">Cuenta 123-45678/1</h1>
          <p className="text-sm text-gray-700 mt-2">Resumen de tu cuenta</p>
        </div>
      </div>

      {/* Botones para cambiar moneda */}
      <div className="flex justify-center gap-4 mt-4 mb-8">
        <button
          onClick={() => setSelectedCurrency("pesos")}
          className={`px-4 py-2 rounded-lg ${
            selectedCurrency === "pesos" ? "bg-gray-900 text-white" : "bg-gray-200"
          }`}
        >
          Movimientos en pesos
        </button>
        <button
          onClick={() => setSelectedCurrency("dolares")}
          className={`px-4 py-2 rounded-lg ${
            selectedCurrency === "dolares" ? "bg-gray-900 text-white" : "bg-gray-200"
          }`}
        >
          Movimientos en dólares
        </button>
      </div>

      {/* Movimientos en Pesos / Dólares */}
      <div className="flex flex-col items-center gap-6 mb-8">
        {selectedCurrency === "pesos" && (
          <div className="bg-gray-900 bg-opacity-90 text-white p-6 rounded-xl shadow-inner shadow-xl w-full max-w-sm">
            <div className="text-lg font-semibold">Saldo en Pesos</div>
            <div className="text-3xl font-bold">{resumenFinanciero.balances_totales.pesos}</div>
          </div>
        )}
        {selectedCurrency === "dolares" && (
          <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg w-full max-w-sm">
            <div className="text-lg font-semibold">Saldo en Dólares</div>
            <div className="text-3xl font-bold">{resumenFinanciero.balances_totales.dolares}</div>
          </div>
        )}
      </div>

      {/* Resumen Financiero */}
      <section className="my-8 max-w-xl mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen Financiero</h3>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300">
          {selectedCurrency === "pesos" && (
            <p className="border-b border-gray-300 pb-2">
              <strong>Total en Pesos:</strong> {resumenFinanciero.balances_totales.pesos}
            </p>
          )}
          {selectedCurrency === "dolares" && (
            <p className="border-b border-gray-300 pb-2">
              <strong>Total en Dólares:</strong> {resumenFinanciero.balances_totales.dolares}
            </p>
          )}
        </div>
      </section>

      {/* Préstamos Activos */}
      {resumenFinanciero.prestamos && (
        <section className="my-8 max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Préstamos Activos</h3>
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="border-b border-gray-300 pb-2">
              <strong>Total Pendiente:</strong> {resumenFinanciero.prestamos.total_pendiente}
            </p>
            <p className="border-b border-gray-300 pb-2">
              <strong>Próxima Cuota:</strong> {resumenFinanciero.prestamos.proxima_cuota}
            </p>
            <p>
              <strong>Préstamos Activos:</strong> {resumenFinanciero.prestamos.cantidad_activos}
            </p>
          </div>
        </section>
      )}

      {/* Transferencias Recientes */}
      {resumenFinanciero.transferencias_recientes && (
        <section className="my-8 max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transferencias Recientes</h3>
          <ul className="space-y-4">
            {resumenFinanciero.transferencias_recientes.map((transferencia: any, index: number) => (
              <li key={index} className="p-4 bg-gray-50 shadow-md rounded-xl border border-gray-300">
                <p><strong>Cuenta Origen:</strong> {transferencia.cuenta_origen}</p>
                <p><strong>Cuenta Destino:</strong> {transferencia.cuenta_destino}</p>
                <p><strong>Monto:</strong> {transferencia.monto}</p>
                <p><strong>Fecha:</strong> {transferencia.fecha}</p>
                <p><strong>Descripción:</strong> {transferencia.descripcion}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Pagos Recientes */}
      {resumenFinanciero.pagos_recientes && (
        <section className="my-8 max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Pagos Recientes</h3>
          <ul className="space-y-4">
            {resumenFinanciero.pagos_recientes.map((pago: any, index: number) => (
              <li key={index} className="p-4 bg-gray-50 shadow-md rounded-xl border border-gray-300">
                <p><strong>Servicio:</strong> {pago.servicio}</p>
                <p><strong>Monto:</strong> {pago.monto}</p>
                <p><strong>Estado:</strong> {pago.estado}</p>
                <p><strong>Fecha de Pago:</strong> {pago.fecha_pago}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
