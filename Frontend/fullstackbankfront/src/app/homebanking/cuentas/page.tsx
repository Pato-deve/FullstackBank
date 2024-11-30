"use client";
import WithHeader from "../WithHeader";
import { useState, useEffect } from "react";
import axiosInstance from "@/axiosConfig"; // Asegúrate de tener configurado tu axios
import ForexExchange from "./ForexExchange";

export default function Cuentas() {
  const [openExchangeModal, setOpenExchangeModal] = useState(false);
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
      .catch((err) => {
        setError("Error al cargar las cuentas.");
        setLoading(false);
      });

    axiosInstance
      .get("/api/finanzas/resumen/")
      .then((response) => {
        setResumenFinanciero(response.data);
      })
      .catch((err) => {
        setError("Error al cargar el resumen financiero.");
      });
  }, []);

  if (loading) {
    return <div className="text-center">Cargando cuentas...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  // Filtramos los saldos por moneda seleccionada
  const saldoPesos = cuentas.reduce((acc, cuenta) => acc + cuenta.balance_pesos, 0);
  const saldoDolares = cuentas.reduce((acc, cuenta) => acc + cuenta.balance_dolares, 0);

  if (!resumenFinanciero) {
    return <div className="text-center">Datos del resumen financiero no disponibles.</div>;
  }

  return (
    <>
      <WithHeader
        title="Cuenta 123-45678/1"
        submenuOptions={[
          {
            id: 1,
            text: "Convertir divisas",
            callback: () => setOpenExchangeModal(true),
          },
        ]}
        tags={[
          {
            text: "Movimientos en pesos",
            callback: () => setSelectedCurrency("pesos"),
          },
          {
            text: "Movimientos en dólares",
            callback: () => setSelectedCurrency("dolares"),
          },
        ]}
      >
       <div className="flex flex-col items-center justify-center mx-16 mb-8 mt-4 gap-y-4">
        {/* Mostrar solo el saldo correspondiente */}
        {selectedCurrency === "pesos" && (
          <div className="flex flex-col items-center gap-2 bg-cyan-600 p-4 rounded-lg shadow-lg w-full max-w-sm text-center">
            <div className="text-2xl font-semibold">Saldo en Pesos</div>
            <div className="text-3xl text-blue-900 font-bold">{resumenFinanciero.balances_totales.pesos}</div>
          </div>
        )}

        {selectedCurrency === "dolares" && (
          <div className="flex flex-col items-center gap-2 bg-emerald-200 p-4 rounded-lg shadow-lg w-full max-w-sm text-center">
            <div className="text-2xl font-semibold">Saldo en Dólares</div>
            <div className="text-3xl text-green-800 font-bold">{resumenFinanciero.balances_totales.dolares}</div>
          </div>
        )}
      </div>

        <main className="te xt-xl gap-y-4">
          {/* Resumen Financiero */}
          <section className="my-8">
            <h3 className="text-2xl font-semibold">Resumen Financiero</h3>
            <div className="mt-4 bg-gray-100 p-6 rounded-lg shadow-md space-y-2 text-lg text-gray-800">
              {selectedCurrency === "pesos" && (
                <p className="border-b border-gray-400 pb-2 w-80">
                  <strong>Total en Pesos:</strong> {resumenFinanciero.balances_totales.pesos}
                </p>
              )}
              {selectedCurrency === "dolares" && (
                <p className="border-b border-gray-400 pb-2 w-80">
                  <strong>Total en Dólares:</strong> {resumenFinanciero.balances_totales.dolares}
                </p>
              )}
            </div>
          </section>

          {/* Mostrar préstamos activos solo si hay datos */}
          {resumenFinanciero.prestamos && (
            <section className="my-8 bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">Préstamos Activos</h3>
              <div className="mt-4 space-y-2 text-lg">
                <p className="border-b border-gray-400 pb-2 w-80">
                  <strong>Total Pendiente:</strong> {resumenFinanciero.prestamos.total_pendiente}
                </p>
                <p className="border-b border-gray-400 pb-2 w-80">
                  <strong>Próxima Cuota:</strong> {resumenFinanciero.prestamos.proxima_cuota}
                </p>
                <p className="border-b border-gray-400 pb-2 w-80">
                  <strong>Préstamos Activos:</strong> {resumenFinanciero.prestamos.cantidad_activos}
                </p>
              </div>
            </section>
          )}

          {/* Mostrar transferencias solo si hay datos */}
          {resumenFinanciero.transferencias_recientes && (
            <section className="my-8 bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">Transferencias Recientes</h3>
              <ul className="mt-4 space-y-4">
                {resumenFinanciero.transferencias_recientes.map((transferencia: any, index: number) => (
                  <li key={index} className="p-4 bg-white shadow-md rounded-lg border-b border-gray-200">
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

          {/* Mostrar pagos solo si hay datos */}
          {resumenFinanciero.pagos_recientes && (
            <section className="my-8 bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">Pagos Recientes</h3>
              <ul className="mt-4 space-y-4">
                {resumenFinanciero.pagos_recientes.map((pago: any, index: number) => (
                  <li key={index} className="p-4 bg-white shadow-md rounded-lg border-b border-gray-200">
                    <p><strong>Servicio:</strong> {pago.servicio}</p>
                    <p><strong>Monto:</strong> {pago.monto}</p>
                    <p><strong>Estado:</strong> {pago.estado}</p>
                    <p><strong>Fecha de Pago:</strong> {pago.fecha_pago}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </WithHeader>

      {/* Modal de Forex */}
      <ForexExchange open={openExchangeModal} onClose={() => setOpenExchangeModal(false)} />
    </>
  );
}
