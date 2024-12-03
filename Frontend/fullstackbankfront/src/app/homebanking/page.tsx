"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/axiosConfig";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faMoneyBillTransfer, faFile, faChevronRight } from "@fortawesome/free-solid-svg-icons";

// Hook para obtener el resumen financiero
function useResumenFinanciero() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      axiosInstance
        .get("http://localhost:8000/api/finanzas/resumen/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setResumen(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("No se pudo cargar el resumen financiero.");
          setLoading(false);
        });
    } else {
      setError("Token no encontrado");
      setLoading(false);
    }
  }, []);

  return { resumen, loading, error };
}

// Hook para obtener las últimas 3 transferencias
function useUltimasTransferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      axiosInstance
        .get("http://localhost:8000/api/finanzas/transferencias/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setTransferencias(res.data.slice(0, 3));  // Mostrar solo las 3 últimas transferencias
          setLoading(false);
        })
        .catch(() => {
          setError("No se pudieron cargar las transferencias.");
          setLoading(false);
        });
    } else {
      setError("Token no encontrado");
      setLoading(false);
    }
  }, []);

  return { transferencias, loading, error };
}

export default function HomeBanking() {
  const { resumen, loading, error } = useResumenFinanciero();
  const { transferencias, loading: loadingTransferencias, error: errorTransferencias } = useUltimasTransferencias();
  const [tarjetas, setTarjetas] = useState([]);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      axiosInstance
        .get("http://localhost:8000/api/finanzas/tarjetas/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => setTarjetas(res.data))
        .catch(() => console.error("Error obteniendo las tarjetas"));
    }
  }, []);

  if (loading || loadingTransferencias) return <div>Cargando...</div>;
  if (error || errorTransferencias) return <div>{error || errorTransferencias}</div>;

  const { balances_totales } = resumen || {};
  const acciones = [
    { icon: faMoneyBillWave, label: "Depositar" },
    { icon: faMoneyBillTransfer, label: "Transferir" },
    { icon: faFile, label: "Movimientos" },
  ];

  const primeraTarjeta = tarjetas.length > 0 ? tarjetas[0] : null;

  return (
    <section className="content-wrapper py-20 px-2">
      {/* Sección de cuentas */}
      <section className="w-full max-w-sm mx-auto">
        {balances_totales ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-gray-600 text-lg font-semibold">Saldo Total:</h3>
            <p className="text-gray-800 font-bold text-xl">${balances_totales.pesos}</p>
            <div className="flex justify-around mt-8">
              {acciones.map((action, index) => (
                <div key={index} className="flex flex-col items-center">
                  <button className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full shadow-md flex items-center justify-center">
                    <FontAwesomeIcon icon={action.icon} className="text-2xl" />
                  </button>
                  <span className="text-sm mt-2">{action.label}</span>
                </div>
              ))}
            </div>
            {/* Mover la tarjeta aquí */}
            {primeraTarjeta ? (
              <div className="mt-8 flex justify-center">
                <Link href="/homebanking/tarjetas">
                  <div
                    className={`cursor-pointer bg-white p-4 rounded-lg shadow-lg w-80 h-20 text-left overflow-hidden ${
                      primeraTarjeta.tipo_tarjeta === "credito"
                        ? "bg-gradient-to-br from-gray-800 to-black"
                        : "bg-gradient-to-br from-blue-900 to-blue-950"
                    }`}
                  >
                    <div className="flex justify-between items-start h-full">
                      <div className="flex flex-col justify-start space-y-1">
                        <span className="text-white text-sm font-semibold">{primeraTarjeta.tipo_tarjeta.toUpperCase()}</span>
                        <span className="text-white text-xs">{primeraTarjeta.proveedor}</span>
                      </div>
                      <div className="flex items-end space-x-2">
                        <p className="text-gray-200 text-xs">Ver info</p>
                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-200 text-xs" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <p className="text-center text-gray-600">No tienes tarjetas disponibles.</p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">No tienes cuentas disponibles.</p>
        )}
      </section>

      {/* Sección de últimas transacciones */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-center mb-8">Tus Últimas Transacciones</h2>
        {transferencias.length > 0 ? (
          <div className="flex justify-center w-full">
          <div className="bg-white shadow-md rounded-lg w-full max-w-sm p-6">
            {transferencias.map((transferencia, index) => (
              <div key={index} className="border-b py-3">
                <p className="text-gray-600 text-sm">Fecha: {transferencia.fecha}</p>
                <p className="text-gray-800 font-semibold">Monto: ${transferencia.monto}</p>
                <p className="text-gray-600 text-sm">Destinatario: {transferencia.destinatario}</p>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No tienes transacciones recientes.</p>
        )}
      </section>

      {/* Sección de préstamo */}
      <section className="mt-12">
        <Link href="/homebanking/prestamos">
          <div className="bg-gradient-to-br from-gray-700 to-gray-400 text-white p-4 rounded-lg shadow-md text-center max-h-20 max-w-sm mx-auto">
            <h2 className="text-md font-semibold">¡Pedí un préstamo!</h2>
            <p className="mt-2 text-m">Hasta $1,200,000.</p>
          </div>
        </Link>
      </section>
    </section>
  );
}
