"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/axiosConfig";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faMoneyBillTransfer, faFile, faChevronRight } from "@fortawesome/free-solid-svg-icons";

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

function useUltimasTransferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      // Primero obtenemos el usuario autenticado
      axiosInstance
        .get("http://localhost:8000/api/usuarios/detalle/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const usuarioId = res.data.id; // Obtenemos el ID del usuario logueado
          
          // Luego obtenemos todas las cuentas asociadas al usuario
          axiosInstance
            .get("http://localhost:8000/api/finanzas/cuentas/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((res) => {
              const cuentas = res.data;

              // Filtramos las transferencias por las cuentas asociadas al usuario
              axiosInstance
                .get("http://localhost:8000/api/finanzas/transferencias/", {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                .then((res) => {
                  // Filtramos las transferencias que involucren las cuentas del usuario
                  const transferenciasFiltradas = res.data.filter((transferencia) => 
                    cuentas.some((cuenta) => 
                      cuenta.id === transferencia.cuenta_origen || cuenta.id === transferencia.cuenta_destino
                    )
                  );

                  // Ordenamos las transferencias por fecha de forma descendente (de más nueva a más vieja)
                  const transferenciasOrdenadas = transferenciasFiltradas.sort(
                    (a, b) => new Date(b.fecha) - new Date(a.fecha)
                  );

                  // Tomamos las 3 últimas transferencias
                  setTransferencias(transferenciasOrdenadas.slice(0, 3));
                  setLoading(false);
                })
                .catch(() => {
                  setError("No se pudieron cargar las transferencias.");
                  setLoading(false);
                });
            })
            .catch(() => {
              setError("No se pudieron obtener las cuentas del usuario.");
              setLoading(false);
            });
        })
        .catch(() => {
          setError("No se pudo obtener los detalles del usuario.");
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
      <section className="content-wrapper py-20 px-4 bg-gray-100 min-h-screen">
        <section className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-8">
          {balances_totales ? (
              <>
                <h3 className="text-gray-600 text-lg font-semibold text-center mb-4">Saldo Total</h3>
                <p className="text-gray-800 font-bold text-3xl text-center">${balances_totales.pesos}</p>
                <div className="grid grid-cols-3 gap-6 mt-8">
                  {acciones.map((action, index) => (
                      <div
                          key={index}
                          className="flex flex-col items-center bg-gradient-to-br from-gray-200 to-gray-300 p-4 rounded-lg hover:shadow-lg transition-transform transform hover:cursor-pointer"
                      >
                        <button
                            className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full shadow-md flex items-center justify-center">
                          <FontAwesomeIcon icon={action.icon} className="text-3xl"/>
                        </button>
                        <span className="text-sm font-semibold mt-2">{action.label}</span>
                      </div>
                  ))}
                </div>
                {primeraTarjeta && (
                    <div className="mt-10 flex justify-center">
                      <Link href="/homebanking/tarjetas">
                        <div
                            className={`cursor-pointer bg-white p-6 rounded-lg shadow-lg w-96 h-28 flex justify-between items-center transform hover:scale-105 transition-transform ${
                                primeraTarjeta.tipo_tarjeta === "credito"
                                    ? "bg-gradient-to-br from-gray-800 to-black"
                                    : "bg-gradient-to-br from-blue-900 to-blue-950"
                            }`}
                        >
                          <div>
                            <h4 className="text-white text-lg font-bold">
                              {primeraTarjeta.tipo_tarjeta.toUpperCase()}
                            </h4>
                            <p className="text-white text-sm">{primeraTarjeta.proveedor}</p>
                          </div>
                          <FontAwesomeIcon
                              icon={faChevronRight}
                              className="text-white text-2xl"
                          />
                        </div>
                      </Link>
                    </div>
                )}
              </>
          ) : (
              <p className="text-center text-gray-600">No tienes cuentas disponibles.</p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-center mb-8 text-gray-800">
            Tus Últimas Transacciones
          </h2>
          {transferencias.length > 0 ? (
              <div className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-8">
                {transferencias.map((transferencia, index) => (
                    <div
                        key={index}
                        className="border-b border-gray-200 py-4 last:border-0"
                    >
                      <p className="text-gray-600 text-sm">
                        Fecha: {new Date(transferencia.fecha).toLocaleDateString()}
                      </p>
                      <p className="text-gray-800 font-semibold">
                        Monto: ${transferencia.monto}
                      </p>
                    </div>
                ))}
                <div className="flex justify-center mt-6">
                  <Link href="/homebanking/transferencias">
                    <button className="text-blue-500 font-semibold hover:text-blue-700 transition-colors">
                      Ver Más
                    </button>
                  </Link>
                </div>
              </div>
          ) : (
              <p className="text-center text-gray-600">
                No tienes transacciones recientes.
              </p>
          )}
        </section>

        <section className="mt-8">
          <Link href="/homebanking/prestamos">
            <div
                className="relative bg-black text-white p-6 m-2 rounded-lg shadow-md text-center max-w-4xl mx-auto hover:shadow-lg transform transition-transform hover: overflow-hidden"
            >
              <div
                  className="absolute inset-0 bg-gradient-to-r from-black via-gray-600 to-white opacity-40 animate-bg-pulse blur-lg"
              ></div>
              <h2 className="relative z-10 text-xl font-bold tracking-wide leading-tight">
                ¿Necesitás financiación? Estamos aquí para ayudarte
              </h2>
              <p className="relative z-10 mt-4 text-md leading-relaxed">
                Solicita un préstamo de hasta{" "}
                <span className="font-bold">$1,200,000</span> con tasas competitivas y plazos ajustados a tus
                necesidades.
              </p>
              <div className="relative z-10 mt-6">
                <button
                    className="px-4 py-2 bg-white text-gray-900 font-semibold rounded shadow hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    aria-label="Conocer más sobre préstamos"
                >
                  Conocer Más
                </button>
              </div>
            </div>
          </Link>
        </section>

      </section>
  );
}
